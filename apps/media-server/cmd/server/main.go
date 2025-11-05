package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/nebula/media-server/internal/config"
	"github.com/nebula/media-server/internal/handlers"
	"github.com/nebula/media-server/internal/redis"
	"github.com/nebula/media-server/internal/sfu"
)

func main() {
	// Load environment variables
	godotenv.Load()

	// Initialize configuration
	cfg := config.New()

	// Initialize Redis client
	redisClient := redis.NewClient(cfg.RedisHost)
	defer redisClient.Close()

	// Initialize SFU (Selective Forwarding Unit)
	sfuManager := sfu.NewManager(redisClient)

	// Initialize HTTP handlers
	handler := handlers.NewHandler(sfuManager, redisClient)

	// Setup router
	router := mux.NewRouter()

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	// WebRTC signaling endpoints
	router.HandleFunc("/api/stream/start", handler.StartStream).Methods("POST")
	router.HandleFunc("/api/stream/offer", handler.HandleOffer).Methods("POST")
	router.HandleFunc("/api/stream/answer", handler.HandleAnswer).Methods("POST")
	router.HandleFunc("/api/stream/ice", handler.HandleICECandidate).Methods("POST")
	router.HandleFunc("/api/stream/end", handler.EndStream).Methods("POST")

	// WebSocket for signaling
	router.HandleFunc("/ws/signal", handler.HandleWebSocket)

	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🎥 Nebula Media Server starting on port %s\n", port)
	fmt.Printf("📡 WebRTC SFU ready\n")
	fmt.Printf("🔌 Redis connected to %s\n", cfg.RedisHost)

	log.Fatal(http.ListenAndServe(":"+port, router))
}
