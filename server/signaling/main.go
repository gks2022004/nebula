package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"net"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	// Optimize buffer sizes for low latency
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Enable compression can reduce bandwidth but adds latency
	// Keep disabled for lowest latency
	EnableCompression: false,
}

type Message struct {
	Type      string      `json:"type"`
	StreamID  string      `json:"streamId,omitempty"`
	ViewerID  string      `json:"viewerId,omitempty"`
	UserID    string      `json:"userId,omitempty"`
	Username  string      `json:"username,omitempty"`
	Avatar    string      `json:"avatar,omitempty"`
	Content   string      `json:"content,omitempty"`
	SDP       interface{} `json:"sdp,omitempty"`
	Candidate interface{} `json:"candidate,omitempty"`
	CreatedAt string      `json:"createdAt,omitempty"`
}

type Client struct {
	ID            string
	StreamID      string
	Conn          *websocket.Conn
	IsBroadcaster bool
	Send          chan []byte
}

type StreamRoom struct {
	ID          string
	Broadcaster *Client
	Viewers     map[string]*Client
	ChatClients map[string]*Client
	mu          sync.RWMutex
}

type SignalingServer struct {
	rooms map[string]*StreamRoom
	mu    sync.RWMutex
}

func NewSignalingServer() *SignalingServer {
	return &SignalingServer{
		rooms: make(map[string]*StreamRoom),
	}
}

func (s *SignalingServer) getOrCreateRoom(streamID string) *StreamRoom {
	s.mu.Lock()
	defer s.mu.Unlock()

	if room, exists := s.rooms[streamID]; exists {
		return room
	}

	room := &StreamRoom{
		ID:          streamID,
		Viewers:     make(map[string]*Client),
		ChatClients: make(map[string]*Client),
	}
	s.rooms[streamID] = room
	return room
}

func (s *SignalingServer) handleBroadcaster(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	streamID := vars["streamId"]

	log.Printf("Broadcaster connecting for stream: %s", streamID)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	client := &Client{
		ID:            "broadcaster",
		StreamID:      streamID,
		Conn:          conn,
		IsBroadcaster: true,
		Send:          make(chan []byte, 512), // Increased buffer for high throughput
	}
	
	// Set TCP_NODELAY for lower latency (disables Nagle's algorithm)
	if tcpConn, ok := conn.UnderlyingConn().(*net.TCPConn); ok {
		tcpConn.SetNoDelay(true)
	}

	room := s.getOrCreateRoom(streamID)
	room.mu.Lock()
	room.Broadcaster = client
	room.mu.Unlock()

	log.Printf("Broadcaster connected for stream: %s", streamID)

	go s.writePump(client)
	s.readPump(client, room)
}

func (s *SignalingServer) handleViewer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	streamID := vars["streamId"]
	viewerID := vars["viewerId"]

	log.Printf("Viewer %s connecting to stream: %s", viewerID, streamID)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	client := &Client{
		ID:            viewerID,
		StreamID:      streamID,
		Conn:          conn,
		IsBroadcaster: false,
		Send:          make(chan []byte, 512), // Increased buffer for high throughput
	}
	
	// Set TCP_NODELAY for lower latency
	if tcpConn, ok := conn.UnderlyingConn().(*net.TCPConn); ok {
		tcpConn.SetNoDelay(true)
	}

	room := s.getOrCreateRoom(streamID)
	room.mu.Lock()
	room.Viewers[viewerID] = client
	room.mu.Unlock()

	log.Printf("Viewer %s connected to stream: %s", viewerID, streamID)

	// Notify broadcaster about new viewer
	if room.Broadcaster != nil {
		msg := Message{
			Type:     "viewer-joined",
			ViewerID: viewerID,
		}
		data, _ := json.Marshal(msg)
		room.Broadcaster.Send <- data
		log.Printf("Notified broadcaster about viewer: %s", viewerID)
	} else {
		log.Printf("No broadcaster for stream: %s", streamID)
	}

	go s.writePump(client)
	s.readPump(client, room)
}

func (s *SignalingServer) handleChat(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	streamID := vars["streamId"]

	log.Printf("Chat client connecting to stream: %s", streamID)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	clientID := generateClientID()
	client := &Client{
		ID:       clientID,
		StreamID: streamID,
		Conn:     conn,
		Send:     make(chan []byte, 256),
	}

	room := s.getOrCreateRoom(streamID)
	room.mu.Lock()
	room.ChatClients[clientID] = client
	chatCount := len(room.ChatClients)
	room.mu.Unlock()

	log.Printf("Chat client %s connected to stream %s (total: %d)", clientID, streamID, chatCount)

	go s.writePump(client)
	s.readChatPump(client, room)
}

func (s *SignalingServer) readPump(client *Client, room *StreamRoom) {
	defer func() {
		client.Conn.Close()
		s.removeClient(client, room)
	}()

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		s.handleSignalingMessage(client, room, &msg)
	}
}

func (s *SignalingServer) readChatPump(client *Client, room *StreamRoom) {
	defer func() {
		client.Conn.Close()
		room.mu.Lock()
		delete(room.ChatClients, client.ID)
		chatCount := len(room.ChatClients)
		room.mu.Unlock()
		log.Printf("Chat client %s disconnected from stream %s (remaining: %d)", client.ID, client.StreamID, chatCount)
	}()

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}

		room.mu.RLock()
		clientCount := len(room.ChatClients)
		room.mu.RUnlock()

		log.Printf("Received message from client %s in stream %s (total clients: %d)", client.ID, client.StreamID, clientCount)
		log.Printf("Broadcasting chat message in stream %s to %d clients", client.StreamID, clientCount)

		// Broadcast chat message to all clients in the room (including sender)
		room.mu.Lock()
		successCount := 0
		for clientID, chatClient := range room.ChatClients {
			select {
			case chatClient.Send <- message:
				// Message sent successfully
				log.Printf("  -> Sent to client %s", clientID)
				successCount++
			default:
				// Channel full, close and mark for deletion
				log.Printf("  -> Chat client %s channel full, removing", clientID)
				close(chatClient.Send)
				delete(room.ChatClients, clientID)
			}
		}
		room.mu.Unlock()
		log.Printf("Successfully broadcast to %d/%d clients", successCount, clientCount)
	}
}

func (s *SignalingServer) writePump(client *Client) {
	defer client.Conn.Close()

	for message := range client.Send {
		// Set write deadline for faster failure detection (reduces hanging)
		// client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
		
		err := client.Conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			break
		}
	}
}

func (s *SignalingServer) handleSignalingMessage(client *Client, room *StreamRoom, msg *Message) {
	room.mu.RLock()
	defer room.mu.RUnlock()

	log.Printf("Received %s message from %s (broadcaster: %v)", msg.Type, client.ID, client.IsBroadcaster)

	switch msg.Type {
	case "offer":
		if viewer, exists := room.Viewers[msg.ViewerID]; exists {
			data, _ := json.Marshal(msg)
			viewer.Send <- data
			log.Printf("Sent offer to viewer: %s", msg.ViewerID)
		}
	case "answer":
		// Viewer sending answer to broadcaster
		if room.Broadcaster != nil {
			// Add viewerId to the message
			msg.ViewerID = client.ID
			data, _ := json.Marshal(msg)
			room.Broadcaster.Send <- data
			log.Printf("Sent answer from viewer %s to broadcaster", client.ID)
		}
	case "ice-candidate":
		var target *Client
		if client.IsBroadcaster {
			// Broadcaster sending ICE candidate to viewer
			target = room.Viewers[msg.ViewerID]
			if target != nil {
				log.Printf("Sending ICE candidate from broadcaster to viewer: %s", msg.ViewerID)
			}
		} else {
			// Viewer sending ICE candidate to broadcaster
			msg.ViewerID = client.ID
			target = room.Broadcaster
			if target != nil {
				log.Printf("Sending ICE candidate from viewer %s to broadcaster", client.ID)
			}
		}
		if target != nil {
			data, _ := json.Marshal(msg)
			target.Send <- data
		}
	}
}

func (s *SignalingServer) removeClient(client *Client, room *StreamRoom) {
	room.mu.Lock()
	defer room.mu.Unlock()

	if client.IsBroadcaster {
		room.Broadcaster = nil
		// Notify all viewers
		for _, viewer := range room.Viewers {
			close(viewer.Send)
		}
		room.Viewers = make(map[string]*Client)
	} else {
		delete(room.Viewers, client.ID)
		// Notify broadcaster
		if room.Broadcaster != nil {
			msg := Message{
				Type:     "viewer-left",
				ViewerID: client.ID,
			}
			data, _ := json.Marshal(msg)
			room.Broadcaster.Send <- data
		}
	}

	close(client.Send)
}

func generateClientID() string {
	return "client_" + randomString(16)
}

func randomString(n int) string {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		// Fallback to timestamp-based ID if random fails
		return hex.EncodeToString([]byte(string(rune(len(bytes)))))
	}
	return hex.EncodeToString(bytes)
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	server := NewSignalingServer()
	router := mux.NewRouter()

	router.HandleFunc("/broadcast/{streamId}", server.handleBroadcaster)
	router.HandleFunc("/watch/{streamId}/{viewerId}", server.handleViewer)
	router.HandleFunc("/chat/{streamId}", server.handleChat)

	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	handler := enableCORS(router)

	log.Println("WebRTC Signaling Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
