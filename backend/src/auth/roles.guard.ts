import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // 👑 ADMIN PRIVILEGE: Admins can access everything
    if (user.role === UserRole.ADMIN) {
      console.log(`🔑 Admin ${user.name} accessing ${context.getClass().name}.${context.getHandler().name}`);
      return true;
    }

    // Check if user has required role
    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      console.log(`🚫 Access denied for ${user.role} user ${user.name}. Required: ${requiredRoles.join(', ')}`);
      throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
    }

    console.log(`✅ Access granted for ${user.role} user ${user.name}`);
    return true;
  }
}

