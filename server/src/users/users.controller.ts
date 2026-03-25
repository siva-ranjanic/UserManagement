import { Controller, Post, Body, HttpCode, Get, UseGuards, Request, Patch, Delete, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Result } from '../common/entities/api-response.entity';
import { HttpStatus } from '../common/utils/httpstatus';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async register(@Body() createUserDto: CreateUserDto): Promise<Result<any>> {
    try {
      const user = await this.usersService.create(createUserDto);
      // Remove passwordHash before returning
      const { passwordHash, ...resultData } = user;
      return Result.success(resultData);
    } catch (error) {
      if (error.status === 409) {
        return Result.failure('Email already exists.', HttpStatus.CONFLICT);
      }
      // Removed specific error details as per instruction 2
      return Result.failure('Failed to register user.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Request() req): Promise<Result<any>> {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    
    // Add flat role field for frontend convenience
    const userRoles = userObj.roles || [];
    const primaryRole = userRoles.length > 0 
      ? (typeof userRoles[0] === 'object' ? (userRoles[0] as any).name : userRoles[0])
      : 'User';

    const { passwordHash, ...resultData } = userObj;
    return Result.success({ ...resultData, role: primaryRole });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('avatar')
  @ApiOperation({ summary: 'Upload profile image' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadAvatar(@Request() req, @UploadedFile() file: any): Promise<Result<any>> {
    const avatarPath = `/uploads/avatars/${file.filename}`;
    const user = await this.usersService.update(req.user.userId, { avatar: avatarPath } as any);
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { passwordHash, ...resultData } = userObj;
    return Result.success(resultData);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Result<any>> {
    try {
      const { roles, isActive, ...safeUpdateDto } = updateUserDto;
      const updatedUser = await this.usersService.update(req.user.userId, safeUpdateDto);
      // Remove passwordHash
      const { passwordHash, ...resultData } = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
      return Result.success(resultData);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return Result.failure(error.message, HttpStatus.NOT_FOUND);
      }
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('profile')
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid password.' })
  async deleteProfile(@Request() req, @Body() body: any): Promise<Result<any>> {
    const { password } = body;
    if (!password) {
      return Result.failure('Password is required to delete profile', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash) {
      return Result.failure('Accounts created via SSO cannot be deleted with a password. Please contact support.', HttpStatus.BAD_REQUEST);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return Result.failure('Invalid current password', HttpStatus.BAD_REQUEST);
    }

    await this.usersService.remove(req.user.userId);
    return Result.success({ message: 'User profile deleted successfully' });
  }
}
