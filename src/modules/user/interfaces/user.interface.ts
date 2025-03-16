export interface IUser {
  id: string;
  name: string;
  email: string;
  telegramHandle: string;
  userType: 'Investor' | 'Company' | 'Admin';
  fundOrCompany: string;
  emailVerified: boolean;
  createdAt: Date;
  verifyEmailCode: string;
}
