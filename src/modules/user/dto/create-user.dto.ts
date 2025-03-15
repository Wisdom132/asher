import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export enum UserType {
  Investor = 'Investor',
  Company = 'Company',
  Admin = 'Admin',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  telegramHandle: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsString()
  @IsNotEmpty()
  fundOrCompany: string;

  @IsString()
  @MinLength(6)
  password: string;
}
