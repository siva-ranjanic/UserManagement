import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get, Delete, Param, Query, Response } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Result } from '../common/entities/api-response.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
 
  // --- SSO ROUTES ---
  @Get('google')
  @SkipThrottle()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth(@Request() req) {}

  @Get('google/callback')
  @SkipThrottle()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google auth callback' })
  async googleAuthRedirect(@Request() req, @Response() res) {
    return this.handleSsoRedirect(req, res, 'google');
  }

  @Get('github')
  @SkipThrottle()
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Login with GitHub' })
  async githubAuth(@Request() req) {}

  @Get('github/callback')
  @SkipThrottle()
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub auth callback' })
  async githubAuthRedirect(@Request() req, @Response() res) {
    return this.handleSsoRedirect(req, res, 'github');
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Strict: 5 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Request() req, @Body() loginDto: LoginDto): Promise<Result<any>> {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const device = req.headers['user-agent'] || 'Unknown Device';
      const data = await this.authService.login(loginDto, ip, device);
      return Result.success(data);
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        return Result.failure(error.message, HttpStatus.UNAUTHORIZED);
      }
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid current password.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<Result<any>> {
    try {
      await this.authService.changePassword(req.user.userId, changePasswordDto);
      return Result.success({ message: 'Password changed successfully' });
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST) {
        return Result.failure(error.message, HttpStatus.BAD_REQUEST);
      }
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Strict: 5 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset token' })
  @ApiResponse({ status: 200, description: 'Reset email sent if user exists.' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<Result<any>> {
    await this.authService.forgotPassword(forgotPasswordDto);
    return Result.success({ message: 'If an account exists with this email, a reset link has been sent.' });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successful.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<Result<any>> {
    try {
      await this.authService.resetPassword(resetPasswordDto);
      return Result.success({ message: 'Password has been reset successfully' });
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST) {
        return Result.failure(error.message, HttpStatus.BAD_REQUEST);
      }
      return Result.failure('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<Result<any>> {

    try {
      const tokens = await this.authService.refreshAccessToken(refreshToken);
      return Result.success(tokens);
    } catch (error) {
      return Result.failure(error.message || 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle() // Skip global throttle for authenticated routes
  @ApiBearerAuth()
  @Get('sessions')
  @ApiOperation({ summary: 'List active sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully.' })
  async getSessions(@Request() req): Promise<Result<any>> {
    const sessions = await this.authService.getActiveSessions(req.user.userId);
    return Result.success(sessions);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully.' })
  async revokeSession(@Param('id') id: string, @Request() req): Promise<Result<any>> {
    await this.authService.revokeSession(req.user.userId, id);
    return Result.success({ message: 'Session revoked successfully' });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('sessions')
  @ApiOperation({ summary: 'Revoke all sessions (Logout all)' })
  @ApiResponse({ status: 200, description: 'All sessions revoked successfully.' })
  async revokeAllSessions(@Request() req): Promise<Result<any>> {
    await this.authService.revokeAllSessions(req.user.userId);
    return Result.success({ message: 'All sessions revoked successfully' });
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully and user logged in.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async verifyEmail(
    @Request() req,
    @Body('token') token: string, // Although it's matching a query in the frontend, I'll allow body or query if I adjust later. Usually preferred as Query for simple links.
  ): Promise<Result<any>> {
    // Standardizing on query param for simplicity of links
    const verifyToken = req.query.token as string;
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const device = req.headers['user-agent'] || 'Unknown Device';
      const data = await this.authService.verifyEmail(verifyToken, ip, device);
      return Result.success(data);
    } catch (error) {
      return Result.failure(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  private async handleSsoRedirect(req: any, res: any, provider: string) {
    const ssoUser = req.user;
    const ip = req.ip || req.connection.remoteAddress;
    const device = req.headers['user-agent'] || 'Unknown Device';

    const user = await this.authService.validateSsoUser(ssoUser, provider);
    const authData = await this.authService.loginSso(user, ip, device);

    // Redirect to frontend with tokens
    // In production, use meaningful redirect and secure cookies or query params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/sso-callback?token=${authData.accessToken}&refreshToken=${authData.refreshToken}`);
  }
}

