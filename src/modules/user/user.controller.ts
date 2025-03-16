import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { HelperService } from 'src/utils/helpers';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly helperService: HelperService,
  ) {}

  @Post('create-user')
  async createUser(@Body() dto: CreateUserDto) {
    const createdUser = await this.userService.createUser(dto);
    return this.helperService.sendObjectResponse(
      'User created successfully',
      createdUser,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers() {
    const allUsers = await this.userService.getUsers();
    return this.helperService.sendObjectResponse(
      'All users retrieved',
      allUsers,
    );
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const userDetails = await this.userService.getUserById(id);
    return this.helperService.sendObjectResponse('User retrieved', userDetails);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const updatedUser = await this.userService.updateUser(id, dto);
    return this.helperService.sendObjectResponse('User updated', updatedUser);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const deletedUser = await this.userService.deleteUser(id);
    return this.helperService.sendObjectResponse('User deleted', deletedUser);
  }
}
