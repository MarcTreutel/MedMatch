import { Controller, Get, Post, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { Roles } from '../auth/roles.decorator'; // 🔥 ADD THIS
import { Request } from 'express';

@Controller('api/users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post()
  // 🔥 No @Roles decorator - this endpoint needs to be accessible during registration
  async createOrUpdateUser(@Body() userData: any) {
    try {
      const { auth0Id, email, name, role } = userData;
      console.log("Creating/updating user:", { auth0Id, email, name, role });

      // Check if user exists
      let user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });

      if (user) {
        console.log("User exists:", user.id, "Current role:", user.role);
  
        // 🔒 CRITICAL: Roles are immutable ONLY after they've been set
        if (user.role && role && role !== user.role) {
          console.log("Role change blocked - roles are immutable:", user.role, "->", role);
          return { 
            error: 'Role cannot be changed after initial selection',
            user: user 
        };
       }
  
      // Update existing user (name, email, and role if it's the first time)
      user.name = name || user.name;
      user.email = email || user.email;
  
      // Allow role setting if current role is null (first-time selection)
      if (!user.role && role) {
        console.log("Setting role for first time:", user.role, "->", role);
        user.role = role;
      }

      } else {
        console.log("Creating new user");
        // Create new user
        user = this.userRepository.create({
          auth0_id: auth0Id,
          email,
          name,
          role: role || null 
        });
      }

      const savedUser = await this.userRepository.save(user);
      console.log("User saved:", savedUser);
      return savedUser;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return { error: 'Failed to create/update user' };
    }
  }

  @Get(':auth0Id')
  // @Roles(UserRole.STUDENT, UserRole.CLINIC, UserRole.ADMIN) // 🔥 All authenticated users can get user data (temporarily disabled) 
  async getUserByAuth0Id(@Param('auth0Id') auth0Id: string) {
    try {
      console.log("Getting user by auth0Id:", auth0Id);
      
      // Try direct match first
      let user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });
      
      if (user) {
        console.log("User found with direct match:", user.id);
        return user;
      }
      
      // Try with auth0| prefix if not found
      if (!auth0Id.startsWith('auth0|')) {
        const formattedAuth0Id = `auth0|${auth0Id}`;
        user = await this.userRepository.findOne({
          where: { auth0_id: formattedAuth0Id }
        });
        
        if (user) {
          console.log("User found with auth0| prefix:", user.id);
          return user;
        }
      }
      
      // Try without auth0| prefix if not found
      if (auth0Id.startsWith('auth0|')) {
        const strippedAuth0Id = auth0Id.replace('auth0|', '');
        user = await this.userRepository.findOne({
          where: { auth0_id: strippedAuth0Id }
        });
        
        if (user) {
          console.log("User found without auth0| prefix:", user.id);
          return user;
        }
      }
      
      console.log("User not found");
      return { error: 'User not found' };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { error: 'Failed to fetch user' };
    }
  }

  // 🔒 SECURE ADMIN ENDPOINT - Only for creating first admin
  @Post('create-first-admin')
  // 🔥 No @Roles decorator - this is a special bootstrap endpoint
  async createFirstAdmin(@Body() data: { targetAuth0Id: string; superAdminSecret: string }) {
    try {
      const { targetAuth0Id, superAdminSecret } = data;
      
      // Check if any admin already exists
      const existingAdmin = await this.userRepository.findOne({
        where: { role: UserRole.ADMIN }
      });
      
      if (existingAdmin) {
        return { success: false, error: 'Admin already exists. Use admin interface to create more admins.' };
      }
      
      // Super secure secret for creating first admin (change this!)
      const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET || 'medmatch-super-secret-2024';
      
      if (superAdminSecret !== SUPER_ADMIN_SECRET) {
        return { success: false, error: 'Invalid super admin secret' };
      }

      // Find target user
      let targetUser = await this.userRepository.findOne({
        where: { auth0_id: targetAuth0Id }
      });

      if (!targetUser) {
        return { success: false, error: 'Target user not found' };
      }

      // Promote to admin
      targetUser.role = UserRole.ADMIN;
      const updatedUser = await this.userRepository.save(targetUser);

      console.log("First admin created:", updatedUser.id);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error creating first admin:', error);
      return { success: false, error: 'Failed to create admin' };
    }
  }

  // 🔥 NEW: Admin-only endpoint to view all users
  @Get()
  @Roles(UserRole.ADMIN) // 🔥 Only admins can see all users
  async getAllUsers() {
    try {
      const users = await this.userRepository.find({
        select: ['id', 'auth0_id', 'email', 'name', 'role', 'created_at', 'updated_at']
      });
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return { error: 'Failed to fetch users' };
    }
  }

  // 🔥 NEW: Admin-only endpoint to promote users to admin
  @Post('promote-to-admin')
  @Roles(UserRole.ADMIN) // 🔥 Only existing admins can create new admins
  async promoteToAdmin(@Body() data: { targetAuth0Id: string }) {
    try {
      const { targetAuth0Id } = data;
      
      // Find target user
      let targetUser = await this.userRepository.findOne({
        where: { auth0_id: targetAuth0Id }
      });

      if (!targetUser) {
        return { success: false, error: 'Target user not found' };
      }

      if (targetUser.role === UserRole.ADMIN) {
        return { success: false, error: 'User is already an admin' };
      }

      // Promote to admin
      targetUser.role = UserRole.ADMIN;
      const updatedUser = await this.userRepository.save(targetUser);

      console.log("User promoted to admin:", updatedUser.id);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      return { success: false, error: 'Failed to promote user' };
    }
  }

  // 🚫 REMOVED INSECURE ENDPOINTS:
  // - set-role (allowed anyone to change roles with simple key)
  // - promote-to-admin (allowed anyone to become admin with simple key)
  // These are security vulnerabilities and have been removed
}

