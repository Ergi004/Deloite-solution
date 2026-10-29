import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole, UserStatus } from '../types/enums';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: UserRole;
  companyId: string | null;
  status?: UserStatus;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /** Only use this for password verification (login, change-password); passwordHash is excluded by default. */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /** Only use this for password verification (login, change-password); passwordHash is excluded by default. */
  async findByIdWithPassword(id: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  create(input: CreateUserInput): User {
    return this.userRepository.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
      companyId: input.companyId,
      status: input.status ?? UserStatus.ACTIVE,
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update({ id }, { lastLoginAt: new Date() });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.userRepository.update({ id }, { passwordHash });
  }

  async setStatus(id: string, status: UserStatus): Promise<void> {
    await this.userRepository.update({ id }, { status });
  }

  async findByCompany(companyId: string) {
    return this.userRepository.find({
      where: { companyId, role: UserRole.STUDENT },
    });
  }
}
