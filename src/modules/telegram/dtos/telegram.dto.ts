import { IsString, IsArray, ArrayMinSize } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  investorName: string;

  @IsString()
  companyName: string;

  @IsArray()
  @ArrayMinSize(1)
  participantUsernames: string[];
}
