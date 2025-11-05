import { useEffect, useRef, useState } from 'react'

const MEDIA_SERVER_URL = process.env.NEXT_PUBLIC_MEDIA_SERVER_URL || 'http://localhost:8080'

export function useWebRTC(streamId: string, isPublisher: boolean = false) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const localStream = useRef<MediaStream | null>(null)
  const remoteStream = useRef<MediaStream | null>(null)

  useEffect(() => {
    initWebRTC()

    return () => {
      cleanup()
    }
  }, [streamId, isPublisher])

  const initWebRTC = async () => {
    try {
      // Create peer connection
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      })

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to media server
          fetch(`${MEDIA_SERVER_URL}/api/stream/ice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              streamId,
              candidate: event.candidate,
            }),
          })
        }
      }

      // Handle connection state changes
      peerConnection.current.onconnectionstatechange = () => {
        const state = peerConnection.current?.connectionState
        setIsConnected(state === 'connected')
        
        if (state === 'failed' || state === 'disconnected') {
          setError('Connection failed')
        }
      }

      if (isPublisher) {
        await startPublishing()
      } else {
        await startViewing()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize WebRTC')
    }
  }

  const startPublishing = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      })

      localStream.current = stream

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream)
      })

      // Create offer
      const offer = await peerConnection.current!.createOffer()
      await peerConnection.current!.setLocalDescription(offer)

      // Send offer to media server
      const response = await fetch(`${MEDIA_SERVER_URL}/api/stream/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          offer,
          isPublisher: true,
        }),
      })

      const { answer } = await response.json()
      await peerConnection.current!.setRemoteDescription(answer)

      return stream
    } catch (err) {
      throw new Error('Failed to start publishing')
    }
  }

  const startViewing = async () => {
    try {
      remoteStream.current = new MediaStream()

      // Handle incoming tracks
      peerConnection.current!.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.current?.addTrack(track)
        })
      }

      // Create offer
      const offer = await peerConnection.current!.createOffer()
      await peerConnection.current!.setLocalDescription(offer)

      // Send offer to media server
      const response = await fetch(`${MEDIA_SERVER_URL}/api/stream/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          offer,
          isPublisher: false,
        }),
      })

      const { answer } = await response.json()
      await peerConnection.current!.setRemoteDescription(answer)

      return remoteStream.current
    } catch (err) {
      throw new Error('Failed to start viewing')
    }
  }

  const cleanup = () => {
    localStream.current?.getTracks().forEach((track) => track.stop())
    peerConnection.current?.close()
    localStream.current = null
    remoteStream.current = null
    peerConnection.current = null
  }

  return {
    isConnected,
    error,
    localStream: localStream.current,
    remoteStream: remoteStream.current,
    peerConnection: peerConnection.current,
  }
}
