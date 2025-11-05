import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'
import { SignupDto } from './dto/signup.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, username, password, displayName } = signupDto

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      throw new UnauthorizedException('Email or username already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName: displayName || username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    })

    // Generate tokens
    const tokens = await this.generateTokens(user.id)

    return {
      user,
      ...tokens,
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Check if banned
    if (user.isBanned) {
      throw new UnauthorizedException('Account has been banned')
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
      },
      ...tokens,
    }
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    // Generate new tokens
    const tokens = await this.generateTokens(storedToken.userId)

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    })

    return tokens
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    })
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId }

    // Access token
    const accessToken = this.jwtService.sign(payload)

    // Refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    })

    // Store refresh token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user
      return result
    }

    return null
  }
}
