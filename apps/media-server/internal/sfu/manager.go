package sfu

import (
	"fmt"
	"sync"

	"github.com/nebula/media-server/internal/redis"
	"github.com/pion/webrtc/v3"
)

type Stream struct {
	ID          string
	Publisher   *webrtc.PeerConnection
	Subscribers map[string]*webrtc.PeerConnection
	mu          sync.RWMutex
}

type Manager struct {
	streams     map[string]*Stream
	mu          sync.RWMutex
	redisClient *redis.Client
}

func NewManager(redisClient *redis.Client) *Manager {
	return &Manager{
		streams:     make(map[string]*Stream),
		redisClient: redisClient,
	}
}

func (m *Manager) CreateStream(streamID string) (*Stream, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.streams[streamID]; exists {
		return nil, fmt.Errorf("stream already exists")
	}

	stream := &Stream{
		ID:          streamID,
		Subscribers: make(map[string]*webrtc.PeerConnection),
	}

	m.streams[streamID] = stream

	// Notify via Redis
	m.redisClient.Publish("media:stream:created", streamID)

	return stream, nil
}

func (m *Manager) GetStream(streamID string) (*Stream, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	stream, exists := m.streams[streamID]
	if !exists {
		return nil, fmt.Errorf("stream not found")
	}

	return stream, nil
}

func (m *Manager) RemoveStream(streamID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	stream, exists := m.streams[streamID]
	if !exists {
		return fmt.Errorf("stream not found")
	}

	// Close all peer connections
	if stream.Publisher != nil {
		stream.Publisher.Close()
	}

	for _, sub := range stream.Subscribers {
		sub.Close()
	}

	delete(m.streams, streamID)

	// Notify via Redis
	m.redisClient.Publish("media:stream:ended", streamID)

	return nil
}

func (m *Manager) AddSubscriber(streamID, subscriberID string, pc *webrtc.PeerConnection) error {
	stream, err := m.GetStream(streamID)
	if err != nil {
		return err
	}

	stream.mu.Lock()
	defer stream.mu.Unlock()

	stream.Subscribers[subscriberID] = pc

	return nil
}

func (m *Manager) RemoveSubscriber(streamID, subscriberID string) error {
	stream, err := m.GetStream(streamID)
	if err != nil {
		return err
	}

	stream.mu.Lock()
	defer stream.mu.Unlock()

	if pc, exists := stream.Subscribers[subscriberID]; exists {
		pc.Close()
		delete(stream.Subscribers, subscriberID)
	}

	return nil
}

func (s *Stream) SetPublisher(pc *webrtc.PeerConnection) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Publisher = pc
}
