import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa'; // 🔧 Changed from * as jwksClient

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwksClientInstance: jwksClient.JwksClient;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.jwksClientInstance = jwksClient({
      jwksUri: 'https://dev-5mnvqv6rgrbb4ml1.us.auth0.com/.well-known/jwks.json',
      cache: true,
      rateLimit: true,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Only log when there's an actual request, not on startup
      if (request.url) {
        console.log('JWT Guard - No valid token provided for:', request.url);
      }
      throw new UnauthorizedException('No valid token provided');
    }

    try {
      const token = authHeader.substring(7);
      const decoded = jwt.decode(token, { complete: true }) as any;
      
      if (!decoded) {
        throw new UnauthorizedException('Invalid token format');
      }

      const auth0Id = decoded.payload.sub;
      console.log('JWT Guard - Decoded auth0Id:', auth0Id);

      const user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });

      if (!user) {
        console.log('JWT Guard - User not found for auth0Id:', auth0Id);
        throw new UnauthorizedException('User not found');
      }

      console.log('JWT Guard - User found:', user.id, user.name);
      request.user = user;
      return true;

    } catch (error) {
      console.log('JWT Guard Error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
