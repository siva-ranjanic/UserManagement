import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { PasswordReset, PasswordResetDocument } from './password-reset.schema';
import { Session, SessionDocument } from './session.schema';
import { RandomNumberGenerator } from '../common/utils/random.generator';

import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.schema';
import { MailService } from '../mail/mail.service';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(PasswordReset.name) private passwordResetModel: Model<PasswordResetDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private auditService: AuditService,
    private mailService: MailService,
  ) {}


  async loginSso(user: any, ipAddress: string, device: string) {
    const roleNames = (user.roles || []).map(r => typeof r === 'object' ? (r as any).name : r);
    const payload = { email: user.email, sub: user._id, roles: roleNames };
    
    const tokenFamily = crypto.randomBytes(32).toString('hex');
    const session = new this.sessionModel({
      _id: RandomNumberGenerator.getUniqueId(),
      userId: user._id,
      tokenFamily,
      ipAddress,
      device,
      lastActivity: new Date(),
    });

    await session.save();

    await this.auditService.log({
      actorId: user._id.toString(),
      action: AuditAction.LOGIN,
      resource: 'auth',
      resourceId: session._id.toString(),
      ipAddress,
      userAgent: device,
      status: 'SUCCESS',
      newValues: { note: `SSO Login via ${user.ssoProvider}` },
    });

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user._id, sessionId: session._id, family: tokenFamily },
      { expiresIn: '30d' },
    );

    await this.usersService.update(user._id.toString(), { lastLogin: new Date() } as any);

    const userRoles = user.roles || [];
    const primaryRole = userRoles.length > 0 
      ? (typeof userRoles[0] === 'object' ? (userRoles[0] as any).name : userRoles[0])
      : 'User';

    return {
      accessToken,
      refreshToken,
      session_id: session._id,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        role: primaryRole
      },
    };
  }

  async login(loginDto: LoginDto, ipAddress: string, device: string) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      await this.auditService.log({
        action: AuditAction.LOGIN,
        resource: 'auth',
        ipAddress,
        userAgent: device,
        status: 'FAILURE',
        errorDetails: `Invalid email: ${email}`,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email address first.');
    }


    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account is temporarily locked. Try again in ${remainingMinutes} minutes.`);
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('This account uses SSO. Please sign in with Google or GitHub.');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordMatching) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: any = { failedLoginAttempts: attempts };
      
      let lockMessage = 'Invalid credentials';
      if (attempts >= 5) {
        updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        updateData.failedLoginAttempts = 0; // Reset after lock
        lockMessage = 'Account locked due to too many failed attempts. Please try again in 15 minutes.';
      }

      await this.usersService.update(user._id.toString(), updateData);

      await this.auditService.log({
        actorId: user._id.toString(),
        action: AuditAction.LOGIN,
        resource: 'auth',
        ipAddress,
        userAgent: device,
        status: 'FAILURE',
        errorDetails: lockMessage,
      });
      throw new UnauthorizedException(lockMessage);
    }

    // Success: reset attempts and lock
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await this.usersService.update(user._id.toString(), {
        failedLoginAttempts: 0,
        lockUntil: null,
      } as any);
    }

    const roleNames = (user.roles || []).map(r => typeof r === 'object' ? (r as any).name : r);
    const payload = { email: user.email, sub: user._id, roles: roleNames };
    
    // Check for active sessions within the last 30 minutes from DIFFERENT devices/IPs
    const isForceLogin = loginDto.forceLogin === true || (loginDto.forceLogin as any) === 'true';
    console.log(`[AUTH] Login attempt for ${email} | ForceLogin: ${isForceLogin}`);

    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    const activeSessions = await this.sessionModel.find({ 
      userId: user._id, 
      isRevoked: false,
      lastActivity: { $gte: thirtyMinutesAgo },
      // Important: don't flag sessions from the same IP AND Device as a "conflict" 
      $or: [
        { ipAddress: { $ne: ipAddress } },
        { device: { $ne: device } }
      ]
    }).exec();

    if (activeSessions.length > 0 && !isForceLogin) {
      await this.auditService.log({
        actorId: user._id.toString(),
        action: AuditAction.LOGIN,
        resource: 'auth',
        ipAddress,
        userAgent: device,
        status: 'FAILURE',
        errorDetails: 'Concurrent session detected',
      });
      // We use a custom property in the exception to signal the frontend
      throw new UnauthorizedException({
        statusCode: 409,
        message: 'You have an active session on another device. Do you want to continue and logout other sessions?',
        error: 'Conflict',
        type: 'CONCURRENT_SESSION'
      });
    }

    if (isForceLogin) {
      await this.revokeAllSessions(user._id.toString());
    } else {
      // Auto-revoke any stale sessions from this EXACT device/IP to prevent buildup
      await this.sessionModel.updateMany(
        { userId: user._id, ipAddress, device, isRevoked: false },
        { $set: { isRevoked: true } }
      ).exec();
    }

    // Create session record
    const tokenFamily = crypto.randomBytes(32).toString('hex');
    const session = new this.sessionModel({
      _id: RandomNumberGenerator.getUniqueId(),
      userId: user._id,
      tokenFamily,
      ipAddress,
      device,
      lastActivity: new Date(),
    });

    await session.save();

    // Log successful login
    await this.auditService.log({
      actorId: user._id.toString(),
      action: AuditAction.LOGIN,
      resource: 'auth',
      resourceId: session._id.toString(),
      ipAddress,
      userAgent: device,
      status: 'SUCCESS',
    });

    // Generate tokens - Syncing with 30m session requirement
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
    const refreshToken = this.jwtService.sign(
      { sub: user._id, sessionId: session._id, family: tokenFamily },
      { expiresIn: '30d' },
    );

    // Update last login
    await this.usersService.update(user._id.toString(), { lastLogin: new Date() } as any);

    const userRoles = user.roles || [];
    const primaryRole = userRoles.length > 0 
      ? (typeof userRoles[0] === 'object' ? (userRoles[0] as any).name : userRoles[0])
      : 'User';

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      session_id: session._id,

      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        lastLogin: new Date(),
        roles: user.roles,
        role: primaryRole
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { sessionId, family } = payload;

    // Validate session
    const session = await this.sessionModel.findOne({
      _id: sessionId as any,
      tokenFamily: family,
      isRevoked: false,
    }).exec();

    if (!session) {
      // Possible token reuse — revoke entire family
      await this.sessionModel.updateMany(
        { tokenFamily: family },
        { $set: { isRevoked: true } },
      ).exec();
      throw new UnauthorizedException('Session has been revoked. Please log in again.');
    }

    const user = await this.usersService.findById(payload.sub.toString());
    if (!user) throw new UnauthorizedException('User not found');

    // Rotate: generate a new token family
    const newFamily = crypto.randomBytes(32).toString('hex');
    session.tokenFamily = newFamily;
    session.lastActivity = new Date();
    await session.save();

    const roleNames = (user.roles || []).map(r => typeof r === 'object' ? (r as any).name : r);
    const newAccessToken = this.jwtService.sign(
      { email: user.email, sub: user._id, roles: roleNames },
      { expiresIn: '30m' },
    );
    const newRefreshToken = this.jwtService.sign(
      { sub: user._id, sessionId: session._id, family: newFamily },
      { expiresIn: '30d' },
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }


  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Accounts created via SSO do not have a local password to change.');
    }

    const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);

    await this.usersService.update(userId, {
      passwordHash: newPasswordHash,
      passwordChangedAt: new Date(),
    } as any);

    await this.auditService.log({
      actorId: userId,
      action: AuditAction.PASSWORD_CHANGE,
      resource: 'users',
      resourceId: userId,
      ipAddress: 'N/A', // Service context, IP usually captured in controller/interceptor
      status: 'SUCCESS',
    });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // For security, don't reveal if user exists. Just return.
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await this.passwordResetModel.deleteMany({ email: user.email });
    await this.passwordResetModel.create({
      _id: RandomNumberGenerator.getUniqueId(),
      email: user.email,
      token: hashedToken,
      expiresAt,
    });


    // Send Password Reset Email
    await this.mailService.sendPasswordResetEmail(user.email, token);

    console.log(`[MAIL MOCK] To: ${user.email} | Reset Token: ${token}`);
    console.log(`[MAIL MOCK] URL: http://localhost:5173/reset-password?token=${token}`);
  }


  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await this.passwordResetModel.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.usersService.findByEmail(resetRecord.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await this.usersService.update(user._id.toString(), {
      passwordHash: newPasswordHash,
      passwordChangedAt: new Date(),
    } as any);

    await this.auditService.log({
      actorId: user._id.toString(),
      action: AuditAction.PASSWORD_RESET,
      resource: 'users',
      resourceId: user._id.toString(),
      ipAddress: 'N/A',
      status: 'SUCCESS',
    });

    await this.passwordResetModel.deleteMany({ email: user.email });
  }

  async getActiveSessions(userId: string): Promise<Session[]> {
    return this.sessionModel.find({ userId: userId as any, isRevoked: false }).sort({ lastActivity: -1 }).exec();
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionModel.findOne({ _id: sessionId as any, userId: userId as any }).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    session.isRevoked = true;
    await session.save();

    await this.auditService.log({
      actorId: userId,
      action: AuditAction.LOGOUT,
      resource: 'sessions',
      resourceId: sessionId,
      ipAddress: 'N/A',
      status: 'SUCCESS',
    });
  }

  async revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
    const filter: any = { userId: userId as any, isRevoked: false };
    if (exceptSessionId) {
      filter._id = { $ne: exceptSessionId as any };
    }
    await this.sessionModel.updateMany(filter, { $set: { isRevoked: true } }).exec();
  }

  async verifyEmail(token: string, ipAddress: string, device: string) {
    const user = await this.usersService['userModel'].findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    }).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    }).exec();

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    await this.auditService.log({
      actorId: user._id.toString(),
      action: AuditAction.USER_UPDATE,
      resource: 'users',
      resourceId: user._id.toString(),
      ipAddress,
      status: 'SUCCESS',
      newValues: { isVerified: true },
    });

    // Auto-login: Create session and generate tokens
    const tokenFamily = crypto.randomBytes(32).toString('hex');
    const session = new this.sessionModel({
      _id: RandomNumberGenerator.getUniqueId(),
      userId: user._id,
      tokenFamily,
      ipAddress,
      device,
      lastActivity: new Date(),
    });

    await session.save();

    const roleNames = (user.roles || []).map(r => typeof r === 'object' ? (r as any).name : r);
    const payload = { email: user.email, sub: user._id, roles: roleNames };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user._id, sessionId: session._id, family: tokenFamily },
      { expiresIn: '30d' },
    );

    const userRoles = user.roles || [];
    const primaryRole = userRoles.length > 0 
      ? (typeof userRoles[0] === 'object' ? (userRoles[0] as any).name : userRoles[0])
      : 'User';

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        role: primaryRole
      },
    };
  }

  async acceptInvitation(acceptInvitationDto: AcceptInvitationDto, ipAddress: string, device: string) {
    const { token, password } = acceptInvitationDto;

    const user = await this.usersService['userModel'].findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    }).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    }).exec();

    if (!user) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    // Set password and verify
    const salt = await bcrypt.genSalt();
    user.passwordHash = await bcrypt.hash(password, salt);
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    await this.auditService.log({
      actorId: user._id.toString(),
      action: AuditAction.USER_UPDATE,
      resource: 'users',
      resourceId: user._id.toString(),
      ipAddress,
      status: 'SUCCESS',
      newValues: { isVerified: true, note: 'Invitation Accepted' },
    });

    // Auto-login: Create session and generate tokens
    const tokenFamily = crypto.randomBytes(32).toString('hex');
    const session = new this.sessionModel({
      _id: RandomNumberGenerator.getUniqueId(),
      userId: user._id,
      tokenFamily,
      ipAddress,
      device,
      lastActivity: new Date(),
    });

    await session.save();

    const roleNames = (user.roles || []).map(r => typeof r === 'object' ? (r as any).name : r);
    const payload = { email: user.email, sub: user._id, roles: roleNames };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user._id, sessionId: session._id, family: tokenFamily },
      { expiresIn: '30d' },
    );

    const userRoles = user.roles || [];
    const primaryRole = userRoles.length > 0 
      ? (typeof userRoles[0] === 'object' ? (userRoles[0] as any).name : userRoles[0])
      : 'User';

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        role: primaryRole
      },
    };
  }

  async validateSsoUser(ssoData: any, provider: string) {
    const { email, firstName, lastName, ssoId, picture } = ssoData;
    
    let user = await this.usersService.findByEmail(email);

    if (user) {
      // Link SS0 if not already linked
      if (!user.ssoId || user.ssoProvider === 'none') {
        user = await this.usersService.update(user._id.toString(), {
          ssoId,
          ssoProvider: provider,
          avatar: picture || user.avatar,
        } as any);
      }
    } else {
      // Auto-register new SSO user
      // 1. Fetch 'User' role
      let defaultRoles: any[] = [];
      const userRole = await this.usersService['roleModel'].findOne({ 
        name: { $regex: new RegExp(`^User$`, 'i') } 
      }).exec();
      
      if (userRole) {
        defaultRoles = [userRole._id];
      }

      // 2. Create user (password-less)
      const newUser = new this.usersService['userModel']({
        _id: RandomNumberGenerator.getUniqueId(),
        firstName,
        lastName,
        email,
        roles: defaultRoles,
        isVerified: true, // SSO users are verified by the provider
        ssoId,
        ssoProvider: provider,
        avatar: picture,
      });

      user = await newUser.save();

      await this.auditService.log({
        action: AuditAction.USER_CREATE,
        resource: 'users',
        resourceId: user._id,
        ipAddress: 'N/A',
        status: 'SUCCESS',
        newValues: { ...user.toObject(), note: 'Created via SSO' },
      });
    }

    return user;
  }
}

