'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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

  useEffect(() => {
    return () => {
      stopStreaming()
    }
  }, [])

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      setLocalStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setIsStreaming(true)
      onStart?.()

      // Connect to signaling server
      connectToSignalingServer(stream)
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

    setIsStreaming(false)
    onStop?.()
  }

  const connectToSignalingServer = (stream: MediaStream) => {
    const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || 'ws://localhost:8080'
    const ws = new WebSocket(`${signalingUrl}/broadcast/${streamId}`)

    ws.onopen = () => {
      console.log('Broadcaster connected to signaling server')
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
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }

    const pc = new RTCPeerConnection(configuration)
    peerConnections.current.set(viewerId, pc)

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream)
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
    <div className="glass-dark rounded-xl overflow-hidden">
      <div className="relative aspect-video bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={startStreaming}
              size="lg"
              className="gradient-primary text-lg px-8"
            >
              <Video className="mr-2 h-5 w-5" />
              Start Broadcasting
            </Button>
          </div>
        )}
      </div>

      {isStreaming && (
        <div className="p-4 flex items-center justify-between bg-black/40">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-red-600 px-3 py-1 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-sm font-bold text-white">LIVE</span>
            </div>
            <span className="text-sm text-gray-300">
              {peerConnections.current.size} viewers
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleVideo}
              size="icon"
              variant={videoEnabled ? 'secondary' : 'destructive'}
            >
              {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button
              onClick={toggleAudio}
              size="icon"
              variant={audioEnabled ? 'secondary' : 'destructive'}
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              onClick={stopStreaming}
              variant="destructive"
            >
              End Stream
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
