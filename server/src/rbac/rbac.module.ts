import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { User, UserSchema } from '../users/user.schema';
import { PermissionsService } from './services/permissions.service';
import { RolesService } from './services/roles.service';
import { PermissionsController } from './controllers/permissions.controller';
import { RolesController } from './controllers/roles.controller';
import { SeederService } from './services/seeder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],

  controllers: [PermissionsController, RolesController],
  providers: [PermissionsService, RolesService, SeederService],
  exports: [MongooseModule],
})
export class RbacModule {}
