import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RandomNumberGenerator } from '../../common/utils/random.generator';


export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ type: String, default: () => RandomNumberGenerator.getUniqueId() })
  _id: string;

  @Prop({ required: true, unique: true })

  name: string;

  @Prop()
  description?: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
