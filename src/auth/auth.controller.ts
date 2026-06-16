import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
        const token = await this.authService.registerUser(registerUserDto);
        return  token;
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        const token = await this.authService.loginUser(loginUserDto);
        return token;
    }
}
