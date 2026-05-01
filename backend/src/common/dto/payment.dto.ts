import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  IsNotEmpty,
  IsUUID,
  MaxLength,
} from 'class-validator';

export enum PaymentMethod {
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
  JAZZCASH = 'JazzCash',
  EASYPAYSA = 'EasyPaisa',
}

export enum PaymentStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
}

export class CreatePaymentDto {
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  @IsNotEmpty({ message: 'Payment method is required' })
  method: PaymentMethod;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Transaction ID cannot exceed 100 characters' })
  transactionId?: string;
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus, { message: 'Invalid payment status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: PaymentStatus;
}
