import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  // Enable CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || 'http://localhost:3001',
    credentials: true,
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  )

  // API prefix
  app.setGlobalPrefix('api')

  const port = configService.get('PORT') || 3000
  await app.listen(port)

  console.log(`🚀 Nebula Backend running on: http://localhost:${port}`)
  console.log(`📡 WebSocket gateway ready`)
  console.log(`📊 API docs available at: http://localhost:${port}/api`)
}

bootstrap()
