import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuditAction } from './audit-log.schema';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers, user } = request;
    const userAgent = headers['user-agent'];

    // Only log write operations or specific admin routes
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const resource = url.split('/')[1] || 'root';
    const action = this.mapMethodToAction(method, url);

    return next.handle().pipe(
      tap(async (data) => {
        // Successful response
        await this.logAction(
          user?.userId,
          action,
          resource,
          this.extractResourceId(url),
          null, // For updates, deep diff is complex for an interceptor, usually better in services
          data,
          ip,
          userAgent,
          'SUCCESS',
        );
      }),
      catchError((error) => {
        // Failed response
        this.logAction(
          user?.userId,
          action,
          resource,
          this.extractResourceId(url),
          null,
          null,
          ip,
          userAgent,
          'FAILURE',
          error.message,
        ).catch((err) => this.logger.error('Failed to log audit on error', err));
        
        return throwError(() => error);
      }),
    );
  }

  private mapMethodToAction(method: string, url: string): AuditAction {
    if (url.includes('login')) return AuditAction.LOGIN;
    if (url.includes('logout')) return AuditAction.LOGOUT;
    
    switch (method) {
      case 'POST': return AuditAction.USER_CREATE; // Generalized, refined in specific logs
      case 'PUT':
      case 'PATCH': return AuditAction.USER_UPDATE;
      case 'DELETE': return AuditAction.USER_DELETE;
      default: return AuditAction.USER_UPDATE;
    }
  }

  private extractResourceId(url: string): string | undefined {
    const parts = url.split('/');
    // Check if the last part looks like an ID (usually 24 chars for mongo or uuid)
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length > 10) return lastPart;
    return undefined;
  }

  private async logAction(
    actorId: string | undefined,
    action: AuditAction,
    resource: string,
    resourceId: string | undefined,
    oldValues: any,
    newValues: any,
    ipAddress: string,
    userAgent: string,
    status: 'SUCCESS' | 'FAILURE',
    errorDetails?: string,
  ) {
    try {
      await this.auditService.log({
        actorId,
        action,
        resource,
        resourceId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
        status,
        errorDetails,
      });
    } catch (err) {
      this.logger.error('Error saving audit log', err);
    }
  }
}
