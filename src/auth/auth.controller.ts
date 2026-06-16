import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { Request } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { log } from 'console';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const token = await this.authService.registerUser(registerUserDto);
    return token;
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const token = await this.authService.loginUser(loginUserDto);
    return token;
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.sub;
    const user = await this.userService.findById(userId);
    return {
      fname: user?.fname,
      lname: user?.lname,
      email: user?.email,
      role: user?.role,
    };
  }
}
