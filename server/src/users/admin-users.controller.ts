import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { BulkOperationUserDto, BulkStatusUpdateDto } from './dto/bulk-operation-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Result } from '../common/entities/api-response.entity';

@ApiTags('Admin Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('Admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async create(@Body() createAdminUserDto: CreateAdminUserDto): Promise<Result<any>> {
    try {
      const user = await this.usersService.create(createAdminUserDto as any);
      
      // If roles or isActive were provided, update them. create logic handles only basics right now.
      if (createAdminUserDto.roles || createAdminUserDto.isActive !== undefined) {
         await this.usersService.update(user._id.toString(), {
           ...(createAdminUserDto.roles && { roles: createAdminUserDto.roles }),
           ...(createAdminUserDto.isActive !== undefined && { isActive: createAdminUserDto.isActive })
         } as any);
      }

      const updatedUser = await this.usersService.findById(user._id.toString());
      const { passwordHash, ...resultData } = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
      return Result.success(resultData);
    } catch (error) {
      if (error.status === 409) {
        return Result.failure(error.message, HttpStatus.CONFLICT);
      }
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all users with pagination and filters (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'role', required: false, type: String })
  async findAll(@Query() query: any): Promise<Result<any>> {
    try {
      const { page, limit, search, isActive, role } = query;
      const parsedPage = page ? parseInt(page, 10) : 1;
      const parsedLimit = limit ? parseInt(limit, 10) : 10;
      let parsedIsActive: boolean | undefined = undefined;
      
      if (isActive !== undefined) {
        parsedIsActive = isActive === 'true' || isActive === true;
      }

      const data = await this.usersService.findAll({
        page: parsedPage,
        limit: parsedLimit,
        search,
        isActive: parsedIsActive,
        role,
      });

      // Filter out password hashes
      const safeUsers = data.users.map((u: any) => {
        const obj = u.toObject ? u.toObject() : u;
        const { passwordHash, ...rest } = obj;
        return rest;
      });

      const totalPages = Math.ceil(data.total / parsedLimit);

      return Result.success({ 
        data: safeUsers, 
        total: data.total, 
        page: parsedPage, 
        limit: parsedLimit,
        totalPages
      });
    } catch (error) {
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @Roles('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update any user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(@Param('id') id: string, @Body() updateAdminUserDto: UpdateAdminUserDto): Promise<Result<any>> {
    try {
      // If updating password, hash it first.
      const payload: any = { ...updateAdminUserDto };
      if (payload.password) {
        const salt = await bcrypt.genSalt();
        payload.passwordHash = await bcrypt.hash(payload.password, salt);
        delete payload.password;
      }

      const updatedUser = await this.usersService.update(id, payload);
      const { passwordHash, ...resultData } = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
      return Result.success(resultData);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return Result.failure(error.message, HttpStatus.NOT_FOUND);
      }
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @Roles('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User soft deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async remove(@Param('id') id: string): Promise<Result<any>> {
    try {
      await this.usersService.softDelete(id);
      return Result.success({ message: `User with ID ${id} soft deleted successfully.` });
    } catch (error) {
      if (error instanceof NotFoundException) {
         return Result.failure(error.message, HttpStatus.NOT_FOUND);
      }
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @Roles('Admin')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or deactivate a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async changeStatus(@Param('id') id: string, @Body() body: any): Promise<Result<any>> {
    try {
      const isActive = body.isActive !== undefined ? body.isActive : body.status === 'active';
      if (isActive === undefined && body.status === undefined) {
        return Result.failure('isActive or status field is required.', HttpStatus.BAD_REQUEST);
      }
      const updatedUser = await this.usersService.update(id, { isActive } as any);
      return Result.success({ message: `User status changed to ${isActive ? 'Active' : 'Inactive'}` });
    } catch (error) {
       if (error instanceof NotFoundException) {
         return Result.failure(error.message, HttpStatus.NOT_FOUND);
      }
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @Roles('Admin')
  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Explicitly reset user password (Admin only)' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async resetPassword(@Param('id') id: string, @Body() body: any): Promise<Result<any>> {
    try {
      if (!body.newPassword) {
         return Result.failure('newPassword field is required.', HttpStatus.BAD_REQUEST);
      }
      
      const user = await this.usersService.findById(id);
      if (!user) {
         throw new NotFoundException('User not found');
      }

      const salt = await bcrypt.genSalt();
      const newPasswordHash = await bcrypt.hash(body.newPassword, salt);

      await this.usersService.update(id, {
         passwordHash: newPasswordHash,
         passwordChangedAt: new Date(),
      } as any);

      return Result.success({ message: 'Password has been explicitly reset by admin.' });
    } catch (error) {
      if (error instanceof NotFoundException) {
         return Result.failure(error.message, HttpStatus.NOT_FOUND);
      }
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @Roles('Admin')
  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk soft-delete users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users soft-deleted successfully.' })
  async bulkDelete(@Body() body: any): Promise<Result<any>> {
    try {
      const ids = body.ids || body.userIds;
      if (!ids || !Array.isArray(ids)) {
         return Result.failure('ids array is required.', HttpStatus.BAD_REQUEST);
      }
      const result = await this.usersService.softDeleteMany(ids);
      return Result.success({ message: `${result.modifiedCount} users soft-deleted successfully.` });
    } catch (error) {
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @Roles('Admin')
  @Patch('bulk/status')
  @ApiOperation({ summary: 'Bulk update user status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users status updated successfully.' })
  async bulkStatusUpdate(@Body() body: any): Promise<Result<any>> {
    try {
      const ids = body.ids || body.userIds;
      const isActive = body.isActive !== undefined ? body.isActive : body.status === 'active';
      
      if (!ids || !Array.isArray(ids) || isActive === undefined) {
         return Result.failure('ids array and isActive status are required.', HttpStatus.BAD_REQUEST);
      }

      const result = await this.usersService.updateStatusMany(ids, isActive);
      return Result.success({ message: `${result.modifiedCount || ids.length} users status updated successfully.` });
    } catch (error) {
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

}
