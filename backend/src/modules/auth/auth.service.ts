import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../../entities/user.entity';

/**
 * AuthService
 * Handles user authentication.
 */
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Dummy login validation
   */
  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmailWithPassword(email);
    
    if (!user || user.password !== pass) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  /**
   * Basic auth handler
   */
  async login(user: User) {
    // Return token in a real app
    return {
      access_token: 'dummy_token',
      userId: user.userId,
      name: user.name,
      role: (user as any).role || 'Customer' // default to customer if missing
    };
  }
}
