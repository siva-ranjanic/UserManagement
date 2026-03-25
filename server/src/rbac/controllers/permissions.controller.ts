import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Result } from '../../common/entities/api-response.entity';

@ApiTags('Admin - Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin') // Only users with the 'Admin' role can manage permissions
@Controller('admin/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission successfully created.' })
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<Result<any>> {
    try {
      const permission = await this.permissionsService.create(createPermissionDto);
      return Result.success(permission);
    } catch (error) {
      return Result.failure(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all permissions' })
  @ApiResponse({ status: 200, description: 'List of permissions returned.' })
  async findAll(): Promise<Result<any[]>> {
    try {
      const permissions = await this.permissionsService.findAll();
      return Result.success(permissions);
    } catch (error) {
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission found.' })
  async findOne(@Param('id') id: string): Promise<Result<any>> {
    try {
      const permission = await this.permissionsService.findById(id);
      return Result.success(permission);
    } catch (error) {
      return Result.failure(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiResponse({ status: 200, description: 'Permission successfully updated.' })
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<Result<any>> {
    try {
      const updated = await this.permissionsService.update(id, updatePermissionDto);
      return Result.success(updated);
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        return Result.failure(error.message, HttpStatus.NOT_FOUND);
      }
      return Result.failure(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission successfully deleted.' })
  async remove(@Param('id') id: string): Promise<Result<any>> {
    try {
      await this.permissionsService.remove(id);
      return Result.success({ message: `Permission ${id} successfully deleted` });
    } catch (error) {
      return Result.failure(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
