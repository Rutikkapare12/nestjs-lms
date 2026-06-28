import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IAuthUser } from './interfaces';

@Injectable()
export class JwtConfigService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  getJwtConfig() {
    return {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION', 3600),
    };
  }

  verifyToken(token: string): IAuthUser | null {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  generateToken(user: Partial<IAuthUser>) {
    const payload = {
      sub: user.sub || user.email,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', 3600),
    });
  }
}
