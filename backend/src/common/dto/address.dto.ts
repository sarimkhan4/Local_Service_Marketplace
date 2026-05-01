import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class CreateAddressDto {
  @IsString({ message: 'Street must be a string' })
  @MinLength(3, { message: 'Street address must be at least 3 characters' })
  @MaxLength(200, { message: 'Street address cannot exceed 200 characters' })
  @IsNotEmpty({ message: 'Street address is required' })
  street: string;

  @IsString({ message: 'City must be a string' })
  @MinLength(2, { message: 'City name must be at least 2 characters' })
  @MaxLength(100, { message: 'City name cannot exceed 100 characters' })
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @IsString({ message: 'State must be a string' })
  @MinLength(2, { message: 'State must be at least 2 characters' })
  @MaxLength(100, { message: 'State cannot exceed 100 characters' })
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @IsString({ message: 'ZIP code must be a string' })
  @MinLength(3, { message: 'ZIP code must be at least 3 characters' })
  @MaxLength(20, { message: 'ZIP code cannot exceed 20 characters' })
  @IsNotEmpty({ message: 'ZIP code is required' })
  zipCode: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Label cannot exceed 50 characters' })
  label?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Street address must be at least 3 characters' })
  @MaxLength(200, { message: 'Street address cannot exceed 200 characters' })
  street?: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'City name must be at least 2 characters' })
  @MaxLength(100, { message: 'City name cannot exceed 100 characters' })
  city?: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'State must be at least 2 characters' })
  @MaxLength(100, { message: 'State cannot exceed 100 characters' })
  state?: string;

  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'ZIP code must be at least 3 characters' })
  @MaxLength(20, { message: 'ZIP code cannot exceed 20 characters' })
  zipCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Label cannot exceed 50 characters' })
  label?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
