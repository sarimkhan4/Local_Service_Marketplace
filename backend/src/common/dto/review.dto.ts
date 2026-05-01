import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsNotEmpty,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1 star' })
  @Max(5, { message: 'Rating cannot exceed 5 stars' })
  @IsNotEmpty({ message: 'Rating is required' })
  rating: number;

  @IsString({ message: 'Comment must be a string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
  comment?: string;
}

export class UpdateReviewDto {
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1 star' })
  @Max(5, { message: 'Rating cannot exceed 5 stars' })
  @IsOptional()
  rating?: number;

  @IsString({ message: 'Comment must be a string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
  comment?: string;
}
