declare module 'express' {
  interface Request {
    user?: { id: string; userType: UserType; email: string };
  }
}
