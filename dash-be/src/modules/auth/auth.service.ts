import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(User: string, password: string): Promise<{ token?: string; needsPasswordChange: boolean }> {
    const user = await this.userRepository.findOne({ where: { User } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.needsPasswordChange) {
      return { needsPasswordChange: true };
    }


    const token = this.jwtService.sign(
      { id: user.id, User: user.User },
      { expiresIn: '30m' },
    );

    return {
      token,
      needsPasswordChange: false,
    };
  }

  async changePassword(User: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { User } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.needsPasswordChange) {
      throw new BadRequestException('Password already changed');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    user.needsPasswordChange = false;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }
}
