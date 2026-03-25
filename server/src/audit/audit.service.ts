import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction } from './audit-log.schema';
import { RandomNumberGenerator } from '../common/utils/random.generator';


@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(data: {
    actorId?: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress: string;
    userAgent?: string;
    status?: 'SUCCESS' | 'FAILURE';
    errorDetails?: string;
  }) {
    const log = new this.auditLogModel({
      ...data,
      _id: RandomNumberGenerator.getUniqueId(),
    });
    return log.save();

  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, action, resource, actorId, startDate, endDate } = query;
    const filter: any = {};

    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (actorId) filter.actorId = actorId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await this.auditLogModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actorId', 'firstName lastName email')
      .exec();

    const total = await this.auditLogModel.countDocuments(filter);

    return {
      logs,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }
}
