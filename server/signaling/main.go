package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
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
	ID         string
	StreamID   string
	Conn       *websocket.Conn
	IsBroadcaster bool
	Send       chan []byte
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

	conn, err := upgrader.Upgrade(w, r, nil)
	if (err != nil) {
		log.Println("Upgrade error:", err)
		return
	}

	client := &Client{
		ID:            "broadcaster",
		StreamID:      streamID,
		Conn:          conn,
		IsBroadcaster: true,
		Send:          make(chan []byte, 256),
	}

	room := s.getOrCreateRoom(streamID)
	room.mu.Lock()
	room.Broadcaster = client
	room.mu.Unlock()

	go s.writePump(client)
	s.readPump(client, room)
}

func (s *SignalingServer) handleViewer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	streamID := vars["streamId"]
	viewerID := vars["viewerId"]

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
		Send:          make(chan []byte, 256),
	}

	room := s.getOrCreateRoom(streamID)
	room.mu.Lock()
	room.Viewers[viewerID] = client
	room.mu.Unlock()

	// Notify broadcaster about new viewer
	if room.Broadcaster != nil {
		msg := Message{
			Type:     "viewer-joined",
			ViewerID: viewerID,
		}
		data, _ := json.Marshal(msg)
		room.Broadcaster.Send <- data
	}

	go s.writePump(client)
	s.readPump(client, room)
}

func (s *SignalingServer) handleChat(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	streamID := vars["streamId"]

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
	room.mu.Unlock()

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
		room.mu.Unlock()
	}()

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}

		// Broadcast chat message to all clients in the room
		room.mu.RLock()
		for _, chatClient := range room.ChatClients {
			select {
			case chatClient.Send <- message:
			default:
				close(chatClient.Send)
				delete(room.ChatClients, chatClient.ID)
			}
		}
		room.mu.RUnlock()
	}
}

func (s *SignalingServer) writePump(client *Client) {
	defer client.Conn.Close()

	for message := range client.Send {
		err := client.Conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			break
		}
	}
}

func (s *SignalingServer) handleSignalingMessage(client *Client, room *StreamRoom, msg *Message) {
	room.mu.RLock()
	defer room.mu.RUnlock()

	switch msg.Type {
	case "offer":
		if viewer, exists := room.Viewers[msg.ViewerID]; exists {
			data, _ := json.Marshal(msg)
			viewer.Send <- data
		}
	case "answer":
		if room.Broadcaster != nil {
			data, _ := json.Marshal(msg)
			room.Broadcaster.Send <- data
		}
	case "ice-candidate":
		var target *Client
		if client.IsBroadcaster {
			target = room.Viewers[msg.ViewerID]
		} else {
			target = room.Broadcaster
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
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[i%len(letters)]
	}
	return string(b)
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
