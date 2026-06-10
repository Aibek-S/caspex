import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SuperAdminOnly } from '../../common/decorators/superadmin-only.decorator';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import type { AuthUser } from '../../common/types/auth-user.type';
import { AuthUserEnvelopeResponseDto } from '../../auth/dto/auth-response.dto';
import { CreateSuperadminUserDto } from '../dto/create-superadmin-user.dto';
import { ListSuperadminUsersQueryDto } from '../dto/list-superadmin-users-query.dto';
import { ResetUserPasswordDto } from '../dto/reset-user-password.dto';
import { SuperadminUsersListResponseDto } from '../dto/superadmin-response.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { SuperadminService } from '../services/superadmin.service';

@Controller('superadmin/users')
@ApiTags('Superadmin')
@ApiBearerAuth('bearer')
@SuperAdminOnly()
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'Unauthorized',
})
@ApiForbiddenResponse({
  type: ErrorResponseDto,
  description: 'SUPERADMIN role is required',
})
export class SuperadminUsersController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Post()
  @ApiOperation({ summary: 'Create user with any platform role' })
  @ApiCreatedResponse({ type: AuthUserEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'Email already exists',
  })
  createUser(@Body() dto: CreateSuperadminUserDto) {
    return this.superadminService.createUser(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List users with filters and pagination' })
  @ApiOkResponse({ type: SuperadminUsersListResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid query',
  })
  listUsers(@Query() query: ListSuperadminUsersQueryDto) {
    return this.superadminService.listUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ type: AuthUserEnvelopeResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'User not found',
  })
  getUser(@Param('id') userId: string) {
    return this.superadminService.getUser(userId);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Change user role' })
  @ApiOkResponse({ type: AuthUserEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'User not found',
  })
  updateUserRole(
    @CurrentUser() actor: AuthUser,
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.superadminService.updateUserRole(actor, userId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or disable user account' })
  @ApiOkResponse({ type: AuthUserEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'User not found',
  })
  updateUserStatus(
    @CurrentUser() actor: AuthUser,
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.superadminService.updateUserStatus(actor, userId, dto);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiOkResponse({ type: AuthUserEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'User not found',
  })
  resetUserPassword(
    @Param('id') userId: string,
    @Body() dto: ResetUserPasswordDto,
  ) {
    return this.superadminService.resetUserPassword(userId, dto);
  }
}
