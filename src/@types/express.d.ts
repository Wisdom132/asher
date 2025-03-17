import { UserType } from '@prisma/client';
declare module 'express' {
  interface Request {
    user?: { id: string; userType: UserType; email: string };
  }
}
