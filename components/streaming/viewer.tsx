'use client'

import { useRef, useEffect, useState } from 'react'
import { Volume2, VolumeX, Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ViewerProps {
  streamId: string
  viewerId: string
}

export function Viewer({ streamId, viewerId }: ViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    connectToStream()

    return () => {
      cleanup()
    }
  }, [streamId, viewerId])

  const connectToStream = async () => {
    const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || 'ws://localhost:8080'
    const ws = new WebSocket(`${signalingUrl}/watch/${streamId}/${viewerId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('Viewer connected to signaling server for stream:', streamId)
    }

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data)
      console.log('Viewer received message:', message.type)

      switch (message.type) {
        case 'offer':
          console.log('Received offer from broadcaster')
          await handleOffer(message.sdp, ws)
          break
        case 'ice-candidate':
          await handleIceCandidate(message.candidate)
          break
      }
    }

    ws.onerror = (error) => {
      console.error('Viewer WebSocket error:', error)
      setIsConnecting(false)
    }

    ws.onclose = () => {
      console.log('Viewer disconnected from signaling server')
      setIsConnected(false)
    }
  }

  const handleOffer = async (sdp: RTCSessionDescriptionInit, ws: WebSocket) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }

    const pc = new RTCPeerConnection(configuration)
    setPeerConnection(pc)

    pc.ontrack = (event) => {
      console.log('Received track from broadcaster:', event.streams[0])
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0]
        setIsConnecting(false)
        setIsConnected(true)
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to broadcaster')
        ws.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate
        }))
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState)
      if (pc.connectionState === 'connected') {
        setIsConnected(true)
        setIsConnecting(false)
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false)
        console.log('Connection failed or disconnected')
      }
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      console.log('Sending answer to broadcaster')
      ws.send(JSON.stringify({
        type: 'answer',
        sdp: answer
      }))
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        console.log('Added ICE candidate from broadcaster')
      } catch (error) {
        console.error('Error adding ICE candidate:', error)
      }
    }
  }

  const cleanup = () => {
    if (peerConnection) {
      peerConnection.close()
      setPeerConnection(null)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div className="glass-dark rounded-xl overflow-hidden group relative">
      <div className="relative aspect-video bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Connecting to stream...</p>
            </div>
          </div>
        )}

        {!isConnected && !isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-white text-lg mb-4">Stream is offline</p>
              <Button onClick={connectToStream}>Retry</Button>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={toggleMute}
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button
            onClick={toggleFullscreen}
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
