import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Controller('api/users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post()
  async createOrUpdateUser(@Body() userData: any) {
    try {
      const { auth0Id, email, name, role } = userData;
      console.log("Creating/updating user:", { auth0Id, email, name, role });

      // Check if user exists
      let user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });

      if (user) {
        console.log("User exists, updating:", user.id);
        // Update existing user
        user.name = name || user.name;
        user.email = email || user.email;
        
        // Allow role updates if provided
        if (role) {
          user.role = role;
        }
      } else {
        console.log("Creating new user");
        // Create new user
        user = this.userRepository.create({
          auth0_id: auth0Id,
          email,
          name,
          role: role || UserRole.STUDENT // Default to student
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

  @Post('set-role')
  async setUserRole(@Body() data: any) {
    try {
      const { auth0Id, role, adminKey } = data;
      console.log("Setting user role:", { auth0Id, role });
      
      // Simple admin key check (replace with proper auth in production)
      const ADMIN_KEY = 'medmatch-admin-2024';
      if (adminKey !== ADMIN_KEY) {
        console.log("Invalid admin key");
        return { success: false, error: 'Unauthorized' };
      }

      // Try to find user with different auth0Id formats
      let user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });
      
      if (!user && auth0Id.startsWith('auth0|')) {
        user = await this.userRepository.findOne({
          where: { auth0_id: auth0Id.replace('auth0|', '') }
        });
      }
      
      if (!user && !auth0Id.startsWith('auth0|')) {
        user = await this.userRepository.findOne({
          where: { auth0_id: `auth0|${auth0Id}` }
        });
      }

      if (!user) {
        console.log("User not found for role update");
        return { success: false, error: 'User not found' };
      }

      // Update role
      user.role = role;
      const updatedUser = await this.userRepository.save(user);
      console.log("User role updated:", updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error setting user role:', error);
      return { success: false, error: 'Failed to set user role' };
    }
  }
  
  @Post('promote-to-admin')
  async promoteToAdmin(@Body() data: any) {
    try {
      const { auth0Id, secretKey } = data;
      console.log("Promoting user to admin:", auth0Id);
      
      // Super admin secret key (replace with proper auth in production)
      const SECRET_KEY = 'medmatch-super-admin-2024';
      if (secretKey !== SECRET_KEY) {
        console.log("Invalid secret key");
        return { success: false, error: 'Unauthorized' };
      }

      // Try to find user with different auth0Id formats
      let user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });
      
      if (!user && auth0Id.startsWith('auth0|')) {
        user = await this.userRepository.findOne({
          where: { auth0_id: auth0Id.replace('auth0|', '') }
        });
      }
      
      if (!user && !auth0Id.startsWith('auth0|')) {
        user = await this.userRepository.findOne({
          where: { auth0_id: `auth0|${auth0Id}` }
        });
      }

      if (!user) {
        console.log("User not found for admin promotion");
        return { success: false, error: 'User not found' };
      }

      // Promote to admin
      user.role = UserRole.ADMIN;
      const updatedUser = await this.userRepository.save(user);
      console.log("User promoted to admin:", updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      return { success: false, error: 'Failed to promote user to admin' };
    }
  }
}
