import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from '../../rbac/schemas/role.schema';
import { Permission } from '../../rbac/schemas/permission.schema';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('No roles assigned');
    }

    // user.roles is populated with Role documents, and their permissions are populated with Permission documents
    const userPermissions = new Set<string>();

    for (const role of user.roles) {
      // Handle "Admin" role as a superuser
      if (role.name === 'Admin') {
        return true;
      }

      if (role.permissions && Array.isArray(role.permissions)) {
        for (const permission of role.permissions) {
          userPermissions.add(permission.name);
        }
      }
    }

    const hasAllRequiredPermissions = requiredPermissions.every((requiredPermission) =>
      userPermissions.has(requiredPermission),
    );

    if (!hasAllRequiredPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
