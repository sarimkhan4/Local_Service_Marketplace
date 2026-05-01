import {
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  Min,
  Max,
  IsNotEmpty,
  IsUUID,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export class CreateBookingDto {
  @IsUUID('4', { message: 'Invalid provider ID format' })
  @IsNotEmpty({ message: 'Provider ID is required' })
  providerId: string;

  @IsArray({ message: 'Services must be an array' })
  @ArrayNotEmpty({ message: 'At least one service must be selected' })
  @IsString({ each: true, message: 'Each service ID must be a string' })
  serviceIds: string[];

  @IsDateString({}, { message: 'Please provide a valid date' })
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @IsString({ message: 'Time must be a string' })
  @Length(5, 8, { message: 'Time must be in HH:MM or HH:MM AM/PM format' })
  @Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)?$/, {
    message: 'Time must be in valid format (e.g., 09:00 or 02:30 PM)',
  })
  @IsNotEmpty({ message: 'Time is required' })
  time: string;

  @IsUUID('4', { message: 'Invalid address ID format' })
  @IsNotEmpty({ message: 'Address ID is required' })
  addressId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus, { message: 'Status must be Pending, Confirmed, Completed, or Cancelled' })
  @IsNotEmpty({ message: 'Status is required' })
  status: BookingStatus;
}

export class AddServiceToBookingDto {
  @IsUUID('4', { message: 'Invalid service ID format' })
  @IsNotEmpty({ message: 'Service ID is required' })
  serviceId: string;
}

