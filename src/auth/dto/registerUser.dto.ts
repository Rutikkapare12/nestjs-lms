import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    fname : string;

    @IsString()
    @IsNotEmpty()   
    lname : string;
    
    @IsEmail()
    email : string;
    
    @MinLength(6)
    @IsString()
    password : string;
}