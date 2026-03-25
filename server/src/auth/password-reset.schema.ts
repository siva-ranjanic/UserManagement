import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RandomNumberGenerator } from '../common/utils/random.generator';


export type PasswordResetDocument = PasswordReset & Document;

@Schema({ timestamps: true })
export class PasswordReset {
  @Prop({ type: String, default: () => RandomNumberGenerator.getUniqueId() })
  _id: string;

  @Prop({ required: true, index: true })
  email: string;


  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);
// Auto-expire after 1 hour using MongoDB TTL index
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
