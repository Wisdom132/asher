import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telegramHandle?: string;

  @IsEnum(['Investor', 'Company', 'Admin'])
  @IsOptional()
  userType?: 'Investor' | 'Company' | 'Admin';

  @IsString()
  @IsOptional()
  fundOrCompany?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}
