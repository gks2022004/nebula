package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/nebula/media-server/internal/redis"
	"github.com/nebula/media-server/internal/sfu"
	"github.com/pion/webrtc/v3"
)

type Handler struct {
	sfuManager  *sfu.Manager
	redisClient *redis.Client
	upgrader    websocket.Upgrader
}

func NewHandler(sfuManager *sfu.Manager, redisClient *redis.Client) *Handler {
	return &Handler{
		sfuManager:  sfuManager,
		redisClient: redisClient,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins for dev (configure properly in production)
			},
		},
	}
}

type StartStreamRequest struct {
	StreamID string `json:"streamId"`
}

type StartStreamResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func (h *Handler) StartStream(w http.ResponseWriter, r *http.Request) {
	var req StartStreamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := h.sfuManager.CreateStream(req.StreamID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusConflict)
		return
	}

	log.Printf("Stream created: %s", req.StreamID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(StartStreamResponse{
		Success: true,
		Message: "Stream created successfully",
	})
}

type OfferRequest struct {
	StreamID    string                    `json:"streamId"`
	Offer       webrtc.SessionDescription `json:"offer"`
	IsPublisher bool                      `json:"isPublisher"`
}

type OfferResponse struct {
	Answer webrtc.SessionDescription `json:"answer"`
}

func (h *Handler) HandleOffer(w http.ResponseWriter, r *http.Request) {
	var req OfferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Create WebRTC peer connection
	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	peerConnection, err := webrtc.NewPeerConnection(config)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Set remote description (offer)
	if err := peerConnection.SetRemoteDescription(req.Offer); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Create answer
	answer, err := peerConnection.CreateAnswer(nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := peerConnection.SetLocalDescription(answer); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Register peer connection with SFU
	stream, err := h.sfuManager.GetStream(req.StreamID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if req.IsPublisher {
		stream.SetPublisher(peerConnection)
		log.Printf("Publisher connected to stream: %s", req.StreamID)
	} else {
		// Add as subscriber
		// Subscriber ID should come from auth/session
		subscriberID := fmt.Sprintf("sub_%d", len(stream.Subscribers))
		h.sfuManager.AddSubscriber(req.StreamID, subscriberID, peerConnection)
		log.Printf("Subscriber %s connected to stream: %s", subscriberID, req.StreamID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(OfferResponse{
		Answer: answer,
	})
}

func (h *Handler) HandleAnswer(w http.ResponseWriter, r *http.Request) {
	// Handle answer from peer
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) HandleICECandidate(w http.ResponseWriter, r *http.Request) {
	// Handle ICE candidate exchange
	w.WriteHeader(http.StatusOK)
}

type EndStreamRequest struct {
	StreamID string `json:"streamId"`
}

func (h *Handler) EndStream(w http.ResponseWriter, r *http.Request) {
	var req EndStreamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.sfuManager.RemoveStream(req.StreamID); err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	log.Printf("Stream ended: %s", req.StreamID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (h *Handler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	log.Println("WebSocket client connected")

	for {
		var msg map[string]interface{}
		if err := conn.ReadJSON(&msg); err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}

		// Handle different message types (ICE candidates, offers, answers)
		msgType, _ := msg["type"].(string)
		log.Printf("Received WebSocket message: %s", msgType)

		// Echo response for now
		conn.WriteJSON(map[string]interface{}{
			"type":    "ack",
			"message": "Message received",
		})
	}
}
