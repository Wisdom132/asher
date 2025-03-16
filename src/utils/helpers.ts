import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const otpGenerator = require('otp-generator');
import { SendMailClient } from 'zeptomail';

@Injectable()
export class HelperService {
  private client: SendMailClient;

  constructor(private readonly jwtService: JwtService) {
    const url = process.env.ZEPTO_URL;
    const token = process.env.ZEPTO_TOKEN;
    this.client = new SendMailClient({ url, token });
  }

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

  public generateToken = async (user) => {
    const token = await this.jwtService.signAsync(user);
    return token;
  };

  public sendEmailVerification = async (
    user: { email: string; name: string },
    content: string,
  ): Promise<void> => {
    try {
      await this.client.sendMail({
        from: {
          address: 'hello@asher.com',
          name: 'Asher',
        },
        to: [
          {
            email_address: {
              address: user.email,
              name: user.name,
            },
          },
        ],
        subject: 'Email Verification',
        htmlBody: content,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email verification');
    }
  };
}
