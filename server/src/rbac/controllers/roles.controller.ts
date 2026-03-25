import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Result } from '../../common/entities/api-response.entity';

@ApiTags('Admin - Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Roles('Admin')
  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role successfully created.' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<Result<any>> {
    try {
      const role = await this.rolesService.create(createRoleDto);
      return Result.success(role);
    } catch (error) {
      return Result.failure(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({ status: 200, description: 'List of roles returned.' })
  async findAll(): Promise<Result<any[]>> {
    try {
      const roles = await this.rolesService.findAll();
      return Result.success(roles);
    } catch (error) {
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({ status: 200, description: 'Role found.' })
  async findOne(@Param('id') id: string): Promise<Result<any>> {
    try {
      const role = await this.rolesService.findById(id);
      return Result.success(role);
    } catch (error) {
      return Result.failure(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role successfully updated.' })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Result<any>> {
    try {
      const updated = await this.rolesService.update(id, updateRoleDto);
      return Result.success(updated);
    } catch (error) {
       if (error.status === HttpStatus.NOT_FOUND) {
        return Result.failure(error.message, HttpStatus.NOT_FOUND);
      }
      return Result.failure(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role successfully deleted.' })
  async remove(@Param('id') id: string): Promise<Result<any>> {
    try {
      await this.rolesService.remove(id);
      return Result.success({ message: `Role ${id} successfully deleted` });
    } catch (error) {
      return Result.failure(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('Admin')
  @Post(':id/permissions')
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully.' })
  async assignPermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ): Promise<Result<any>> {
    try {
      const updated = await this.rolesService.assignPermissions(id, permissionIds);
      return Result.success(updated);
    } catch (error) {
      return Result.failure(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('Admin')
  @Delete(':id/permissions')
  @ApiOperation({ summary: 'Remove permissions from a role' })
  @ApiResponse({ status: 200, description: 'Permissions removed successfully.' })
  async removePermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ): Promise<Result<any>> {
    try {
      const updated = await this.rolesService.removePermissions(id, permissionIds);
      return Result.success(updated);
    } catch (error) {
      return Result.failure(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
