import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return false;
    }

    const hasRole = requiredRoles.some((requiredRole) => 
      user.roles.some((userRole: any) => {
        const roleName = typeof userRole === 'object' ? (userRole.name || '') : userRole;
        return roleName.toLowerCase() === requiredRole.toLowerCase();
      })
    );

    if (!hasRole) {
      console.log(`[RolesGuard] Access Denied. User roles: ${JSON.stringify(user.roles)}. Required: ${requiredRoles}`);
    }

    return hasRole;
  }
}
