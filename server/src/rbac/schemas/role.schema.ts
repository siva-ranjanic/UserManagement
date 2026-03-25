import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Permission } from './permission.schema';
import { RandomNumberGenerator } from '../../common/utils/random.generator';


export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ type: String, default: () => RandomNumberGenerator.getUniqueId() })
  _id: string;

  @Prop({ required: true, unique: true })

  name: string;

  @Prop({ type: [{ type: String, ref: 'Permission' }] })
  permissions: Permission[] | string[];

}

export const RoleSchema = SchemaFactory.createForClass(Role);
