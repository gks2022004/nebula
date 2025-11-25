'use client'

import { useRef, useEffect, useState } from 'react'
import { Video, VideoOff, Mic, MicOff, Settings } from 'lucide-react'

interface BroadcasterProps {
  streamId: string
  onStart?: () => void
  onStop?: () => void
}

export function Broadcaster({ streamId, onStart, onStop }: BroadcasterProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    return () => {
      stopStreaming()
    }
  }, [])

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      })

      setLocalStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      connectToSignalingServer(stream)
      
      setIsStreaming(true)
      onStart?.()
    } catch (error) {
      console.error('Error starting stream:', error)
      alert('Failed to access camera/microphone')
    }
  }

  const stopStreaming = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }

    peerConnections.current.forEach(pc => pc.close())
    peerConnections.current.clear()

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsStreaming(false)
    onStop?.()
  }

  const connectToSignalingServer = (stream: MediaStream) => {
    const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || 'ws://localhost:8080'
    const ws = new WebSocket(`${signalingUrl}/broadcast/${streamId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('Broadcaster connected to signaling server for stream:', streamId)
    }

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data)
      console.log('Broadcaster received message:', message.type)

      switch (message.type) {
        case 'viewer-joined':
          console.log('Viewer joined:', message.viewerId)
          await createPeerConnection(message.viewerId, stream, ws)
          break
        case 'answer':
          console.log('Received answer from viewer:', message.viewerId)
          await handleAnswer(message.viewerId, message.sdp)
          break
        case 'ice-candidate':
          await handleIceCandidate(message.viewerId, message.candidate)
          break
        case 'viewer-left':
          console.log('Viewer left:', message.viewerId)
          closePeerConnection(message.viewerId)
          break
      }
    }

    ws.onerror = (error) => {
      console.error('Broadcaster WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('Broadcaster disconnected from signaling server')
    }
  }

  const createPeerConnection = async (
    viewerId: string,
    stream: MediaStream,
    ws: WebSocket
  ) => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceCandidatePoolSize: 10
    }

    const pc = new RTCPeerConnection(configuration)
    peerConnections.current.set(viewerId, pc)

    stream.getTracks().forEach(track => {
      console.log('Adding track to peer connection:', {
        kind: track.kind,
        id: track.id,
        readyState: track.readyState,
        enabled: track.enabled,
        muted: track.muted
      })
      const sender = pc.addTrack(track, stream)
      
      if (track.kind === 'video') {
        const parameters = sender.getParameters()
        if (!parameters.encodings) {
          parameters.encodings = [{}]
        }
        parameters.encodings[0].maxBitrate = 2500000
        parameters.encodings[0].scaleResolutionDownBy = 1
        sender.setParameters(parameters)
      }
    })

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(JSON.stringify({
          type: 'ice-candidate',
          viewerId,
          candidate: event.candidate
        }))
      }
    }

    pc.onconnectionstatechange = () => {
      console.log(`Broadcaster connection state for viewer ${viewerId}:`, pc.connectionState)
    }

    pc.oniceconnectionstatechange = () => {
      console.log(`Broadcaster ICE connection state for viewer ${viewerId}:`, pc.iceConnectionState)
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    ws.send(JSON.stringify({
      type: 'offer',
      viewerId,
      sdp: offer
    }))
  }

  const handleAnswer = async (viewerId: string, sdp: RTCSessionDescriptionInit) => {
    const pc = peerConnections.current.get(viewerId)
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    }
  }

  const handleIceCandidate = async (viewerId: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnections.current.get(viewerId)
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    }
  }

  const closePeerConnection = (viewerId: string) => {
    const pc = peerConnections.current.get(viewerId)
    if (pc) {
      pc.close()
      peerConnections.current.delete(viewerId)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)
      }
    }
  }

  return (
    <div className="notebook-paper overflow-hidden">
      <div className="relative aspect-video bg-paper-bg border-b-2 border-ink-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper-bg/90">
            <button
              onClick={startStreaming}
              className="hand-button hand-button-pink text-xl px-8 py-4 flex items-center"
            >
              <Video className="mr-3 h-6 w-6" />
              📹 Start Broadcasting
            </button>
          </div>
        )}
      </div>

      {isStreaming && (
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="live-badge">
              <span className="w-2 h-2 bg-white rounded-full mr-1" />
              LIVE
            </div>
            <span className="text-ink font-bold">
              👁️ {peerConnections.current.size} viewers
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleVideo}
              className={`hand-button px-3 py-2 ${videoEnabled ? 'hand-button-blue' : 'hand-button-pink'}`}
            >
              {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </button>
            <button
              onClick={toggleAudio}
              className={`hand-button px-3 py-2 ${audioEnabled ? 'hand-button-blue' : 'hand-button-pink'}`}
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
            <button
              onClick={stopStreaming}
              className="hand-button hand-button-pink px-4 py-2"
            >
              End Stream ✖️
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
