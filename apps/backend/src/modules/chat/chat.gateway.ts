import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { UseGuards } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ChatService } from './chat.service'
import { RedisService } from '../redis/redis.service'

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private userSockets = new Map<string, Set<string>>() // userId -> Set of socketIds

  constructor(
    private chatService: ChatService,
    private redisService: RedisService,
    private jwtService: JwtService
  ) {
    // Subscribe to Redis for chat messages
    this.setupRedisSubscriptions()
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1]

      if (!token) {
        client.disconnect()
        return
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token)
      const userId = payload.sub

      // Store user socket mapping
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set())
      }
      this.userSockets.get(userId).add(client.id)

      client.data.userId = userId

      console.log(`Client connected: ${client.id} (User: ${userId})`)
    } catch (error) {
      console.error('Connection error:', error)
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId

    if (userId && this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId)
      sockets.delete(client.id)

      if (sockets.size === 0) {
        this.userSockets.delete(userId)
      }
    }

    console.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('join_stream')
  async handleJoinStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string }
  ) {
    const { streamId } = data
    await client.join(`stream:${streamId}`)

    // Get recent messages
    const messages = await this.chatService.getMessages(streamId)

    return {
      event: 'chat_history',
      data: messages.reverse(),
    }
  }

  @SubscribeMessage('leave_stream')
  async handleLeaveStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string }
  ) {
    const { streamId } = data
    await client.leave(`stream:${streamId}`)
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; message: string }
  ) {
    const userId = client.data.userId
    const { streamId, message } = data

    // Rate limiting could be added here

    // Save message
    const chatMessage = await this.chatService.saveMessage(streamId, userId, message)

    // Emit to all clients in the stream room
    this.server.to(`stream:${streamId}`).emit('new_message', chatMessage)

    return {
      event: 'message_sent',
      data: chatMessage,
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; streamId: string }
  ) {
    const userId = client.data.userId
    const { messageId, streamId } = data

    await this.chatService.deleteMessage(messageId, userId)

    // Emit deletion to all clients
    this.server.to(`stream:${streamId}`).emit('message_deleted', { messageId })
  }

  private setupRedisSubscriptions() {
    // This allows scaling across multiple server instances
    // All chat messages published to Redis will be broadcast to connected clients
  }
}
