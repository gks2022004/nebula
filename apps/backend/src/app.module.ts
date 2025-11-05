import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BullModule } from '@nestjs/bullmq'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { StreamsModule } from './modules/streams/streams.module'
import { ChatModule } from './modules/chat/chat.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { RedisModule } from './modules/redis/redis.module'

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // BullMQ for background jobs
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),

    // Core modules
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    StreamsModule,
    ChatModule,
    NotificationsModule,
  ],
})
export class AppModule {}
