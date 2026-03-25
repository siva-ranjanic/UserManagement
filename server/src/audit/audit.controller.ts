import { Controller, Get, Query, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { AuditService } from './audit.service';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Result } from '../common/entities/api-response.entity';
import type { Response } from 'express';

@ApiTags('Audit & Analytics')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@ApiBearerAuth()
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get all audit logs with filters' })
  async getLogs(@Query() query: any) {
    const data = await this.auditService.findAll(query);
    return Result.success(data);
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard analytics overview' })
  async getStats() {
    const stats = await this.dashboardService.getStats();
    return Result.success(stats);
  }

  @Get('audit-logs/export')
  @ApiOperation({ summary: 'Export audit logs to CSV' })
  async exportLogs(@Res() res: Response) {
    const { logs } = await this.auditService.findAll({ limit: 1000 });
    
    let csv = 'Timestamp,Actor,Action,Resource,ResourceID,Status,IP Address\n';
    
    logs.forEach((log: any) => {
      const actor = log.actorId ? `${log.actorId.firstName} ${log.actorId.lastName} (${log.actorId.email})` : 'System/Guest';
      csv += `"${log.createdAt}","${actor}","${log.action}","${log.resource}","${log.resourceId || ''}","${log.status}","${log.ipAddress}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('audit-logs.csv');
    return res.send(csv);
  }
}
