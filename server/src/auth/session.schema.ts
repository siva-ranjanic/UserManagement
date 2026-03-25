import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../users/user.schema';
import { RandomNumberGenerator } from '../common/utils/random.generator';


export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, default: () => RandomNumberGenerator.getUniqueId() })
  _id: string;

  @Prop({ type: String, ref: 'User', required: true })
  userId: string | User;


  @Prop({ required: true })
  tokenFamily: string; // For Refresh Token Rotation

  @Prop()
  device: string;

  @Prop()
  ipAddress: string;

  @Prop({ default: Date.now })
  lastActivity: Date;

  @Prop({ default: false })
  isRevoked: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
