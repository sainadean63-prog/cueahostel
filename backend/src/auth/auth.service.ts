import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import * as nodemailer from 'nodemailer';
import type { Response } from 'express';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    this.validateProgramme(dto.programType, dto.yearOfStudy);
    const email = dto.email.toLowerCase();
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { studentId: dto.studentId }] },
    });
    if (exists) throw new ConflictException('Email or student ID already registered');

    const token = randomBytes(32).toString('hex');
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        email,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        course: dto.course.trim(),
        password: await bcrypt.hash(dto.password, 12),
        isVerified: false,
        verificationTokenHash: this.hashToken(token),
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    try {
      await this.sendEmail(
        user.email,
        'Verify your CUEA Gaba hostel account',
        `Verify your email address within 24 hours: ${this.frontendUrl()}/verify-email?token=${token}`,
      );
    } catch (error) {
      await this.prisma.user.delete({ where: { id: user.id } });
      throw error;
    }

    return {
      message: 'Account created. Check your email for a verification link.',
      userId: user.id,
    };
  }

  async verifyEmail(token: string) {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
      throw new BadRequestException('Invalid or expired verification link');
    }
    const user = await this.prisma.user.findFirst({
      where: {
        verificationTokenHash: this.hashToken(token),
        verificationTokenExpiresAt: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Invalid or expired verification link');
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
      },
    });
    return { message: 'Email verified successfully. You can now sign in.' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user && user.isActive) {
      const token = randomBytes(32).toString('hex');
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: this.hashToken(token),
          passwordResetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      try {
        await this.sendEmail(
          user.email,
          'Reset your CUEA Gaba hostel password',
          `Reset your password within one hour: ${this.frontendUrl()}/reset-password?token=${token}`,
        );
      } catch (error) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { passwordResetTokenHash: null, passwordResetTokenExpiresAt: null },
        });
        throw error;
      }
    }
    return {
      message: 'If an active account exists for that email, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: this.hashToken(token),
        passwordResetTokenExpiresAt: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Invalid or expired password reset link');
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(password, 12),
        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,
      },
    });
    return { message: 'Password updated. You can now sign in.' };
  }

  private validateProgramme(programType: string, yearOfStudy: number) {
    const maximumYear = programType === 'DIPLOMA' ? 2 : 4;
    if (yearOfStudy > maximumYear) {
      throw new BadRequestException('Year of study is outside the selected programme duration');
    }
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private frontendUrl() {
    const url = this.config.get<string>('FRONTEND_URL');
    if (!url) throw new InternalServerErrorException('FRONTEND_URL is not configured');
    return url.replace(/\/$/, '');
  }

  private async sendEmail(to: string, subject: string, text: string) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const from = this.config.get<string>('EMAIL_FROM');
    const port = Number(this.config.get<string>('SMTP_PORT'));
    if (!host || !user || !pass || !from || !Number.isInteger(port) || port <= 0) {
      throw new InternalServerErrorException('SMTP email settings are incomplete');
    }
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({ from, to, subject, text });
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (!user.isVerified) {
      throw new UnauthorizedException('Verify your email address before signing in');
    }

    const tokens = await this.generateTokens(user);
    this.setRefreshCookie(res, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      user: this.sanitize(user),
    };
  }

  async refresh(user: User, res: Response) {
    const tokens = await this.generateTokens(user);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  async logout(res: Response) {
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  sanitize(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user;
    return safe;
  }
}
