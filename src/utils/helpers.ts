import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import otpGenerator from 'otp-generator';

@Injectable()
export class HelperService {
  constructor() {}

  public sendObjectResponse<T>(
    message: string,
    data?: T,
  ): Promise<{ message: string; data?: T }> {
    return Promise.resolve({ message, data });
  }

  public hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  };

  public comparePassword = async (
    enteredPassword: string,
    dbPassword: string,
  ) => {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  };
  public generateOTP = () => {
    const otp = otpGenerator.generate(5, {
      specialChars: false,
      digits: true,
    });

    return otp;
  };
}
