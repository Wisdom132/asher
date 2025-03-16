import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserType[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<Request>();
    console.log('User from request:', request.user); // Debugging

    const user = request.user as { userType: UserType };

    if (!user || !user.userType) {
      console.log('No user type found!');
      return false;
    }
    return requiredRoles.includes(user.userType);
  }
}
