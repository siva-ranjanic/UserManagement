import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { Session, SessionDocument } from '../auth/session.schema';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async getStats() {
    const [totalUsers, activeUsers, softDeletedUsers, totalSessions, recentLogs] = await Promise.all([
      this.userModel.countDocuments({ deletedAt: null }).exec(),
      this.userModel.countDocuments({ isActive: true, deletedAt: null }).exec(),
      this.userModel.countDocuments({ deletedAt: { $ne: null } }).exec(),
      this.sessionModel.countDocuments({ isRevoked: false }).exec(),
      this.auditLogModel.find().sort({ createdAt: -1 }).limit(10).populate('actorId', 'firstName lastName email').exec(),
    ]);

    // Role distribution
    const roleStats = await this.userModel.aggregate([
      { $match: { deletedAt: null } },
      { $unwind: '$roles' },
      { $group: { _id: '$roles', count: { $sum: 1 } } },
      { $lookup: { from: 'roles', localField: '_id', foreignField: '_id', as: 'roleInfo' } },
      { $unwind: '$roleInfo' },
      { $project: { name: '$roleInfo.name', count: 1 } },
    ]).exec();

    // Activity stats (logins last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activityStats = await this.auditLogModel.aggregate([
      { $match: { action: 'LOGIN', status: 'SUCCESS', createdAt: { $gte: sevenDaysAgo } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).exec();

    // User growth (count users created per month for the last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const growthStats = await this.userModel.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo }, deletedAt: null } },
      { $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]).exec();

    // Map to a friendlier format for the frontend (labels + data)
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const growthData = growthStats.map(s => ({
      label: monthNames[s._id.month - 1],
      value: s.count
    }));

    return {
      overview: {
        totalUsers,
        activeUsers,
        softDeletedUsers,
        activeSessions: totalSessions,
      },
      roleDistribution: roleStats,
      recentActivity: activityStats,
      latestAuditLogs: recentLogs,
      growthData: growthData
    };
  }
}
