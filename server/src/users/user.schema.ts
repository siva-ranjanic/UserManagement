import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Role } from '../rbac/schemas/role.schema';
import { RandomNumberGenerator } from '../common/utils/random.generator';


export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, default: () => RandomNumberGenerator.getUniqueId() })
  _id: string;

  @Prop({ required: true })

  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  avatar?: string;

  @Prop()
  lastLogin?: Date;

  @Prop()
  passwordChangedAt?: Date;

  @Prop({ type: [{ type: String, ref: 'Role' }] })
  roles: Role[] | string[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  verificationExpires?: Date;


  @Prop({ default: true })
  isActive: boolean;


  @Prop()
  deletedAt?: Date;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop()
  lockUntil?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
