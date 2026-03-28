import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.schema';
import { MailService } from '../mail/mail.service';
import { RandomNumberGenerator } from '../common/utils/random.generator';
import { Role, RoleDocument } from '../rbac/schemas/role.schema';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private auditService: AuditService,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const { firstName, lastName, email, password, role: requestedRole } = createUserDto;

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Fetch role (case-insensitive)
    let defaultRoles: any[] = [];
    const roleName = requestedRole || 'User';
    const userRoleInfo = await this.roleModel.findOne({ 
      name: { $regex: new RegExp(`^${roleName}$`, 'i') } 
    }).exec();
    
    if (userRoleInfo) {
      defaultRoles = [userRoleInfo._id];
    } else {
      // Fallback: try to find 'User' if the requested one failed
      const userFallback = await this.roleModel.findOne({ 
        name: { $regex: new RegExp(`^User$`, 'i') } 
      }).exec();
      if (userFallback) {
        defaultRoles = [userFallback._id];
      }
    }

    const verificationToken = RandomNumberGenerator.getUniqueId();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    const createdUser = new this.userModel({
      _id: RandomNumberGenerator.getUniqueId(),
      firstName,
      lastName,
      email,
      passwordHash,
      roles: defaultRoles,
      isVerified: false,
      verificationToken,
      verificationExpires,
    });


    const savedUser = await createdUser.save();

    await this.auditService.log({
      action: AuditAction.USER_CREATE,
      resource: 'users',
      resourceId: savedUser._id,
      ipAddress: 'N/A',
      status: 'SUCCESS',
      newValues: savedUser.toObject(),
    });

    // Send Verification Email (wrapped in try-catch to ensure registration never fails)
    try {
      await this.mailService.sendVerificationEmail(savedUser.email, verificationToken);
    } catch (mailError) {
      console.error(`[CRITICAL] Registration mail failed for ${savedUser.email}, but user was created.`, mailError.message);
    }

    return savedUser.toObject(); // return plain object


  }

  async invite(inviteUserDto: InviteUserDto): Promise<any> {
    const { firstName, lastName, email, role: requestedRole } = inviteUserDto;

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Fetch role (case-insensitive)
    let defaultRoles: any[] = [];
    const roleName = requestedRole || 'User';
    const userRoleInfo = await this.roleModel.findOne({ 
      name: { $regex: new RegExp(`^${roleName}$`, 'i') } 
    }).exec();
    
    if (userRoleInfo) {
      defaultRoles = [userRoleInfo._id];
    } else {
      const userFallback = await this.roleModel.findOne({ 
        name: { $regex: new RegExp(`^User$`, 'i') } 
      }).exec();
      if (userFallback) {
        defaultRoles = [userFallback._id];
      }
    }

    const verificationToken = RandomNumberGenerator.getUniqueId();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 48); // Invitations last 48 hours

    const createdUser = new this.userModel({
      _id: RandomNumberGenerator.getUniqueId(),
      firstName,
      lastName,
      email,
      roles: defaultRoles,
      isVerified: false,
      verificationToken,
      verificationExpires,
    });

    const savedUser = await createdUser.save();

    await this.auditService.log({
      action: AuditAction.USER_CREATE,
      resource: 'users',
      resourceId: savedUser._id,
      ipAddress: 'N/A',
      status: 'SUCCESS',
      newValues: { ...savedUser.toObject(), note: 'Created via Invitation' },
    });

    try {
      await this.mailService.sendInvitationEmail(savedUser.email, verificationToken, firstName);
    } catch (mailError) {
      console.error(`[CRITICAL] Invitation mail failed for ${savedUser.email}, but user was created.`, mailError.message);
    }

    return savedUser.toObject();
  }


  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    role?: string;
  }): Promise<{ users: UserDocument[]; total: number }> {
    const { page = 1, limit = 10, search, isActive, role } = query;
    const skip = (page - 1) * limit;

    const filter: any = { deletedAt: null };

    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (role) {
      filter.roles = role;
    }

    const [users, total] = await Promise.all([
      this.userModel.find(filter)
        .populate({
          path: 'roles',
          populate: { path: 'permissions' }
        })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return { users, total };
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, deletedAt: null }).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: id, deletedAt: null }).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ _id: id, deletedAt: null }, { $set: updateUserDto }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.auditService.log({
      action: AuditAction.USER_UPDATE,
      resource: 'users',
      resourceId: id,
      ipAddress: 'N/A',
      status: 'SUCCESS',
      newValues: updateUserDto,
    });

    return updatedUser;
  }

  async remove(id: string): Promise<UserDocument> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedUser;
  }

  async softDelete(id: string): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found or already deleted`);
    }

    await this.auditService.log({
      action: AuditAction.USER_DELETE,
      resource: 'users',
      resourceId: id,
      ipAddress: 'N/A',
      status: 'SUCCESS',
    });

    return updatedUser;
  }

  async softDeleteMany(ids: string[]): Promise<any> {
    return this.userModel.updateMany(
      { _id: { $in: ids }, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    ).exec();
  }

  async updateStatusMany(ids: string[], isActive: boolean): Promise<any> {
    await this.userModel.updateMany(
      { _id: { $in: ids }, deletedAt: null },
      { $set: { isActive } },
    ).exec();

    await this.auditService.log({
      action: AuditAction.BULK_OPERATION,
      resource: 'users',
      ipAddress: 'N/A',
      status: 'SUCCESS',
      newValues: { ids, isActive },
    });
  }

  async resendInvitation(id: string): Promise<any> {
    const user = await this.userModel.findOne({ _id: id, isVerified: false, deletedAt: null }).exec();
    if (!user) {
      throw new NotFoundException('Pending invitation not found for this user');
    }

    const verificationToken = RandomNumberGenerator.getUniqueId();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 48);

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    await this.auditService.log({
      action: AuditAction.USER_UPDATE,
      resource: 'users',
      resourceId: id,
      ipAddress: 'N/A',
      status: 'SUCCESS',
      newValues: { action: 'Resend Invitation', verificationExpires },
    });

    try {
      await this.mailService.sendInvitationEmail(user.email, verificationToken, user.firstName);
    } catch (mailError) {
      console.error(`[MAIL ERROR] Resending invitation failed for ${user.email}:`, mailError.message);
    }

    return { message: 'Invitation resent successfully' };
  }

  async revokeInvitation(id: string): Promise<any> {
    const user = await this.userModel.findOne({ _id: id, isVerified: false, deletedAt: null }).exec();
    if (!user) {
      throw new NotFoundException('Pending invitation not found for this user');
    }

    // Soft delete is appropriate for revocation
    user.deletedAt = new Date();
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    await this.auditService.log({
      action: AuditAction.USER_DELETE,
      resource: 'users',
      resourceId: id,
      ipAddress: 'N/A',
      status: 'SUCCESS',
      newValues: { action: 'Revoke Invitation' },
    });

    return { message: 'Invitation revoked successfully' };
  }
}
