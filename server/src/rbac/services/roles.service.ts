import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RandomNumberGenerator } from '../../common/utils/random.generator';


@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleDocument> {
    const existing = await this.roleModel.findOne({ name: createRoleDto.name }).exec();
    if (existing) {
      throw new ConflictException(`Role '${createRoleDto.name}' already exists.`);
    }

    const role = new this.roleModel({
      ...createRoleDto,
      _id: RandomNumberGenerator.getUniqueId(),
    });
    return role.save();

  }

  async findAll(): Promise<RoleDocument[]> {
    return this.roleModel.find().populate('permissions').exec();
  }

  async findById(id: string): Promise<RoleDocument> {
    const role = await this.roleModel.findById(id).populate('permissions').exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleDocument> {
    if (updateRoleDto.name) {
      const existing = await this.roleModel.findOne({ name: updateRoleDto.name }).exec();
      if (existing && existing._id.toString() !== id) {
        throw new ConflictException(`Role '${updateRoleDto.name}' already exists.`);
      }
    }

    const updated = await this.roleModel
      .findByIdAndUpdate(id, { $set: updateRoleDto }, { new: true })
      .populate('permissions')
      .exec();

    if (!updated) {
       throw new NotFoundException(`Role with ID ${id} not found.`);
    }
    return updated;
  }

  async remove(id: string): Promise<RoleDocument> {
    const deleted = await this.roleModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }
    return deleted;
  }

  async assignPermissions(id: string, permissionIds: string[]): Promise<RoleDocument> {
    const updated = await this.roleModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { permissions: { $each: permissionIds } } },
        { new: true }
      )
      .populate('permissions')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }
    return updated;
  }

  async removePermissions(id: string, permissionIds: string[]): Promise<RoleDocument> {
    const updated = await this.roleModel
      .findByIdAndUpdate(
        id,
        { $pull: { permissions: { $in: permissionIds } } },
        { new: true }
      )
      .populate('permissions')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }
    return updated;
  }
}
