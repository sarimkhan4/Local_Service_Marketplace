import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export enum UserRole {
  CUSTOMER = 'Customer',
  PROVIDER = 'Provider',
  ADMIN = 'Admin',
}

export class LoginDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class SignupDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEnum(UserRole, { message: 'Role must be Customer, Provider, or Admin' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Bio cannot exceed 500 characters' })
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;
}
