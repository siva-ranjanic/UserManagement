import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { Permission, PermissionDocument } from '../schemas/permission.schema';
import { User, UserDocument } from '../../users/user.schema';
import { RandomNumberGenerator } from '../../common/utils/random.generator';
import * as bcrypt from 'bcrypt';


@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}


  async onModuleInit() {
    await this.seedPermissionsAndRoles();
    await this.seedAdminUser();
  }


  private async seedPermissionsAndRoles() {
    // 1. Define default permissions based on sprint matrix
    const defaultPermissions = [
      { name: 'user:create', description: 'Can create users' },
      { name: 'user:update', description: 'Can update users' },
      { name: 'user:view',   description: 'Can view users' },
    ];

    const permissionDocs: Record<string, string> = {}; // map name to ObjectId

    for (const p of defaultPermissions) {
      // Definitive cleanup: remove any record with this name that has a legacy 24-char hex ID
      await this.permissionModel.deleteMany({ 
        name: p.name, 
        _id: { $regex: /^[0-9a-fA-F]{24}$/ } 
      }).exec();

      // Final check for a UUID record (length 36)
      let perm = await this.permissionModel.findOne({ name: p.name }).exec();
      
      if (!perm) {
        perm = new this.permissionModel({
          ...p,
          _id: RandomNumberGenerator.getUniqueId(),
        });
        await perm.save();
        this.logger.log(`Created permission (UUID): ${p.name}`);
      }
      permissionDocs[p.name] = perm._id;
    }



    // 2. Define default roles
    const rolesData = [
      {
        name: 'Admin',
        permissions: [permissionDocs['user:create'], permissionDocs['user:update'], permissionDocs['user:view']],
      },
      {
        name: 'Manager',
        permissions: [permissionDocs['user:update'], permissionDocs['user:view']],
      },
      {
        name: 'User',
        permissions: [permissionDocs['user:view']],
      },
    ];

    for (const r of rolesData) {
      // Definitive cleanup: remove legacy ObjectId records for this role name
      await this.roleModel.deleteMany({ 
        name: r.name, 
        _id: { $regex: /^[0-9a-fA-F]{24}$/ } 
      }).exec();

      let role = await this.roleModel.findOne({ name: r.name }).exec();
      if (!role) {
        role = new this.roleModel({
          ...r,
          _id: RandomNumberGenerator.getUniqueId(),
        });
        await role.save();
        this.logger.log(`Created role (UUID): ${r.name}`);
      }
    }




  }

  private async seedAdminUser() {
    const adminEmail = 'admin@example.com';
    const existing = await this.userModel.findOne({ email: adminEmail }).exec();
    
    // Force re-seed if user doesn't exist OR if it still has an old MongoDB ObjectId (length 24)
    if (!existing || String(existing._id).length === 24) {
      if (existing) {
        await this.userModel.deleteOne({ _id: existing._id }).exec();
        this.logger.log(`Removed old ObjectId User: ${adminEmail} for UUID migration.`);
      }


      const adminRole = await this.roleModel.findOne({ name: 'Admin' }).exec();
      if (!adminRole) {
        this.logger.error('Admin role not found. Cannot seed admin user.');
        return;
      }

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash('Admin@123', salt);

      const admin = new this.userModel({
        _id: RandomNumberGenerator.getUniqueId(),
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        passwordHash,
        roles: [adminRole._id],
        isActive: true,
        isVerified: true, // Seeded admins are pre-verified
      });

      await admin.save();
      this.logger.log(`Seeded fresh UUID Admin User: ${adminEmail}`);
    } else if (!existing.isVerified) {
      // Self-correction for existing UUID admins
      await this.userModel.updateOne({ _id: existing._id }, { $set: { isVerified: true } }).exec();
      this.logger.log(`Corrected verification status for existing Admin: ${adminEmail}`);
    }
  }
}

