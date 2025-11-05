import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  public client: Redis
  public subscriber: Redis
  public publisher: Redis

  constructor(private configService: ConfigService) {
    const host = this.configService.get('REDIS_HOST') || 'localhost'
    const port = this.configService.get('REDIS_PORT') || 6379

    // Main client for general operations
    this.client = new Redis({
      host,
      port,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    })

    // Subscriber for pub/sub
    this.subscriber = new Redis({ host, port })

    // Publisher for pub/sub
    this.publisher = new Redis({ host, port })
  }

  async onModuleInit() {
    console.log('✅ Redis connected')
  }

  async onModuleDestroy() {
    await this.client.quit()
    await this.subscriber.quit()
    await this.publisher.quit()
  }

  // Cache operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value)
    } else {
      await this.client.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<void> {
    await this.publisher.publish(channel, message)
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel)
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        callback(msg)
      }
    })
  }
}
