import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './audit-log.schema';
import { AuditService } from './audit.service';
import { DashboardService } from './dashboard.service';
import { AuditController } from './audit.controller';
import { User, UserSchema } from '../users/user.schema';
import { Session, SessionSchema } from '../auth/session.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  providers: [AuditService, DashboardService],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
