import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    async registerUser(registerUserDto: RegisterUserDto) {
        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
      
        const user = await this.userService.createUser({...registerUserDto, password: hashedPassword });
      
        const payload = { sub: user._id, email: user.email };
        const token = await this.jwtService.signAsync(payload);
        return {access_token: token};
    }

    async loginUser(loginUserDto: LoginUserDto) {
        const user = await this.userService.findByEmail(loginUserDto.email);
        if (!user) {
          throw new NotFoundException('User not found');
        }
      
        const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid password');
        }
      
        const payload = { sub: user._id, email: user.email};
        const token = await this.jwtService.signAsync(payload);
        return {access_token: token};
    }
}
