import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor() {}
  @Get('me')
  getMe(@GetUser() user: User) {
    console.log(user);
    return user;
  }

//   @Patch()
//   editUser(
//     @GetUser('id') userId: number,
//     @Body() dto: EditUserDto,
//   ) {
//     return this.userService.editUser(userId, dto);
//   }
}