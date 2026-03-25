import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../users/user.schema';
import { RandomNumberGenerator } from '../common/utils/random.generator';


export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  ROLE_CREATE = 'ROLE_CREATE',
  ROLE_UPDATE = 'ROLE_UPDATE',
  ROLE_DELETE = 'ROLE_DELETE',
  PERMISSION_ASSIGN = 'PERMISSION_ASSIGN',
  PERMISSION_REMOVE = 'PERMISSION_REMOVE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  BULK_OPERATION = 'BULK_OPERATION',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: String, default: () => RandomNumberGenerator.getUniqueId() })
  _id: string;

  @Prop({ type: String, ref: 'User', required: false })
  actorId?: string | User;


  @Prop({ required: true, enum: AuditAction })
  action: AuditAction;

  @Prop({ required: true })
  resource: string;

  @Prop({ required: false })
  resourceId?: string;

  @Prop({ type: Object, required: false })
  oldValues?: any;

  @Prop({ type: Object, required: false })
  newValues?: any;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: false })
  userAgent?: string;

  @Prop({ default: 'SUCCESS', enum: ['SUCCESS', 'FAILURE'] })
  status: string;

  @Prop({ required: false })
  errorDetails?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
