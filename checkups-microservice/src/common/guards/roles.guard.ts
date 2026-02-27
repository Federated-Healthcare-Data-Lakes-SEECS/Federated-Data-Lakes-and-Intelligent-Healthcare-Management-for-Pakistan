import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Invalid user object or roles missing');
    }

    const hasRole = user.roles.some((role: string) => requiredRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Access Denied: You do not have the required role');
    }

    return true;
  }
}
