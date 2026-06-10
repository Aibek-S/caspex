import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { DEFAULT_BCRYPT_ROUNDS } from '../../common/constants/auth.constants';
import { AuthUser } from '../../common/types/auth-user.type';
import { hashPassword } from '../../common/utils/password.util';
import { toUserResponse } from '../../common/utils/user-response.util';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CreateSuperadminUserDto } from '../dto/create-superadmin-user.dto';
import { ListSuperadminUsersQueryDto } from '../dto/list-superadmin-users-query.dto';
import { ResetUserPasswordDto } from '../dto/reset-user-password.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';

type SuperadminBootstrapConfig = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
};

@Injectable()
export class SuperadminService implements OnApplicationBootstrap {
  private readonly bcryptRounds = this.resolveBcryptRounds();

  constructor(private readonly usersRepository: UsersRepository) {}

  async onApplicationBootstrap() {
    await this.ensureBootstrapSuperadmin();
  }

  async createUser(dto: CreateSuperadminUserDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await hashPassword(dto.password, this.bcryptRounds);
    const createdUser = await this.usersRepository.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl ?? null,
      companyName: dto.companyName ?? null,
      companyLogo: dto.companyLogo ?? null,
      city: dto.city ?? null,
      country: dto.country ?? null,
    });

    return { user: toUserResponse(createdUser) };
  }

  async listUsers(query: ListSuperadminUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.usersRepository.findMany({
        skip,
        take: limit,
        role: query.role,
        isActive: query.isActive,
        search: query.search,
      }),
      this.usersRepository.count({
        role: query.role,
        isActive: query.isActive,
        search: query.search,
      }),
    ]);

    return {
      users: users.map(toUserResponse),
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user: toUserResponse(user) };
  }

  async updateUserRole(
    actor: AuthUser,
    userId: string,
    dto: UpdateUserRoleDto,
  ) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (actor.id === userId && dto.role !== UserRole.SUPERADMIN) {
      throw new BadRequestException('Superadmin cannot demote own account');
    }

    const updatedUser = await this.usersRepository.update(userId, {
      role: dto.role,
    });

    return { user: toUserResponse(updatedUser) };
  }

  async updateUserStatus(
    actor: AuthUser,
    userId: string,
    dto: UpdateUserStatusDto,
  ) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (actor.id === userId && !dto.isActive) {
      throw new BadRequestException('Superadmin cannot disable own account');
    }

    const updatedUser = await this.usersRepository.update(userId, {
      isActive: dto.isActive,
    });

    return { user: toUserResponse(updatedUser) };
  }

  async resetUserPassword(userId: string, dto: ResetUserPasswordDto) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await hashPassword(dto.password, this.bcryptRounds);
    const updatedUser = await this.usersRepository.update(userId, {
      passwordHash,
    });

    return { user: toUserResponse(updatedUser) };
  }

  private async ensureBootstrapSuperadmin() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const config = this.getBootstrapConfig();
    if (!config) {
      return;
    }

    const existingUser = await this.usersRepository.findByEmail(config.email);
    if (existingUser) {
      if (existingUser.role !== UserRole.SUPERADMIN) {
        throw new Error(
          'SUPERADMIN_EMAIL already belongs to a non-superadmin user',
        );
      }

      return;
    }

    const passwordHash = await hashPassword(config.password, this.bcryptRounds);
    await this.usersRepository.create({
      email: config.email,
      passwordHash,
      role: UserRole.SUPERADMIN,
      firstName: config.firstName,
      lastName: config.lastName,
      phone: config.phone,
    });
  }

  private getBootstrapConfig(): SuperadminBootstrapConfig | null {
    const rawConfig = {
      email: process.env.SUPERADMIN_EMAIL?.trim().toLowerCase(),
      password: process.env.SUPERADMIN_PASSWORD,
      firstName: process.env.SUPERADMIN_FIRST_NAME?.trim(),
      lastName: process.env.SUPERADMIN_LAST_NAME?.trim(),
      phone: process.env.SUPERADMIN_PHONE?.trim(),
    };

    const values = Object.values(rawConfig);
    const hasAnyValue = values.some(Boolean);
    if (!hasAnyValue) {
      return null;
    }

    if (values.some((value) => !value)) {
      throw new Error(
        'SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_FIRST_NAME, SUPERADMIN_LAST_NAME and SUPERADMIN_PHONE must be set together',
      );
    }

    if (rawConfig.password!.length < 8 || rawConfig.password!.length > 128) {
      throw new Error('SUPERADMIN_PASSWORD must be between 8 and 128 chars');
    }

    return rawConfig as SuperadminBootstrapConfig;
  }

  private resolveBcryptRounds(): number {
    const raw = process.env.BCRYPT_SALT_ROUNDS;
    if (!raw) {
      return DEFAULT_BCRYPT_ROUNDS;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 8 || parsed > 16) {
      throw new Error('BCRYPT_SALT_ROUNDS must be between 8 and 16');
    }

    return Math.floor(parsed);
  }
}
