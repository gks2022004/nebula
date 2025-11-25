'use client'

import { useRef, useEffect, useState } from 'react'
import { Volume2, VolumeX, Maximize } from 'lucide-react'

interface ViewerProps {
  streamId: string
  viewerId: string
}

export function Viewer({ streamId, viewerId }: ViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const hasReceivedOfferRef = useRef(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    connectToStream()

    return () => {
      cleanup()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [streamId, viewerId])

  const connectToStream = async () => {
    const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || 'ws://localhost:8080'
    console.log('Viewer connecting to:', `${signalingUrl}/watch/${streamId}/${viewerId}`)
    const ws = new WebSocket(`${signalingUrl}/watch/${streamId}/${viewerId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('Viewer connected to signaling server for stream:', streamId)
      setIsConnecting(true)
      hasReceivedOfferRef.current = false
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!hasReceivedOfferRef.current) {
          console.log('No offer received within 10 seconds, broadcaster may not be ready')
          setIsConnecting(false)
        }
      }, 10000)
    }

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data)
      console.log('Viewer received message:', message.type)

      switch (message.type) {
        case 'offer':
          console.log('Received offer from broadcaster')
          hasReceivedOfferRef.current = true
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          await handleOffer(message.sdp, ws)
          break
        case 'ice-candidate':
          await handleIceCandidate(message.candidate)
          break
      }
    }

    ws.onerror = (error) => {
      console.warn('Viewer WebSocket connection issue - this is normal during connection')
      setIsConnecting(false)
    }

    ws.onclose = () => {
      console.log('Viewer disconnected from signaling server')
      setIsConnected(false)
    }
  }

  const handleOffer = async (sdp: RTCSessionDescriptionInit, ws: WebSocket) => {
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
    setPeerConnection(pc)

    pc.ontrack = (event) => {
      console.log('Received track from broadcaster:', event.streams[0])
      console.log('Track details:', {
        kind: event.track.kind,
        id: event.track.id,
        readyState: event.track.readyState,
        enabled: event.track.enabled,
        muted: event.track.muted
      })
      if (videoRef.current && event.streams[0]) {
        console.log('Setting video srcObject')
        videoRef.current.srcObject = event.streams[0]
        setIsConnecting(false)
        setIsConnected(true)
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.muted = true
            videoRef.current.play()
              .then(() => {
                console.log('Video playing successfully')
              })
              .catch(err => {
                console.warn('Autoplay prevented, user interaction required:', err.message)
              })
          }
        }
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

    pc.oniceconnectionstatechange = () => {
      console.log('Viewer ICE connection state:', pc.iceConnectionState)
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
    <div className="notebook-paper overflow-hidden group relative">
      <div className="relative aspect-video bg-paper-bg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
          style={{ objectFit: 'cover' }}
        />
        
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper-bg/95">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">📡</div>
              <p className="text-ink font-bold text-xl">Connecting to stream...</p>
              <p className="text-pencil mt-2">Please wait ✨</p>
            </div>
          </div>
        )}

        {!isConnected && !isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper-bg/95">
            <div className="text-center">
              <div className="text-6xl mb-4">📺</div>
              <p className="text-ink text-xl font-bold mb-4">Stream is offline</p>
              <button onClick={connectToStream} className="hand-button hand-button-blue px-6 py-2">
                🔄 Retry
              </button>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleMute}
            className="hand-button hand-button-yellow px-3 py-2"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="hand-button hand-button-blue px-3 py-2"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
