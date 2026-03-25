import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../schemas/permission.schema';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { RandomNumberGenerator } from '../../common/utils/random.generator';


@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionDocument> {
    const existing = await this.permissionModel.findOne({ name: createPermissionDto.name }).exec();
    if (existing) {
      throw new ConflictException(`Permission '${createPermissionDto.name}' already exists.`);
    }

    const permission = new this.permissionModel({
      ...createPermissionDto,
      _id: RandomNumberGenerator.getUniqueId(),
    });
    return permission.save();

  }

  async findAll(): Promise<PermissionDocument[]> {
    return this.permissionModel.find().exec();
  }

  async findById(id: string): Promise<PermissionDocument> {
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found.`);
    }
    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<PermissionDocument> {
    if (updatePermissionDto.name) {
      const existing = await this.permissionModel.findOne({ name: updatePermissionDto.name }).exec();
      if (existing && existing._id.toString() !== id) {
        throw new ConflictException(`Permission '${updatePermissionDto.name}' already exists.`);
      }
    }

    const updated = await this.permissionModel
      .findByIdAndUpdate(id, { $set: updatePermissionDto }, { new: true })
      .exec();

    if (!updated) {
       throw new NotFoundException(`Permission with ID ${id} not found.`);
    }
    return updated;
  }

  async remove(id: string): Promise<PermissionDocument> {
    const deleted = await this.permissionModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Permission with ID ${id} not found.`);
    }
    return deleted;
  }
}
