import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { AuthorizationGuard } from 'src/App/shared/guards/authorization.guard';
import { userDTO } from './user.dto';

@Controller('user')
// @UseGuards(AuthorizationGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  register(@Req() req: Request) {
    return this.userService.registerUser(req);
  }

  @Post('/login')
  login(@Req() req: Request) {
    return this.userService.loginUser(req);
  }

  @Post('/registerauth0')
  registerAuth0(@Body() data: userDTO) {
    this.userService.registerAuth0User(data);
    return 'ok';
  }

  @Get('/auth0/email/:email')
  getByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmailAuth0(email);
  }
  @Delete('/userauth')
  accessToken() {
    this.userService.deleteAuth0();
    return 'ok';
  }
}
