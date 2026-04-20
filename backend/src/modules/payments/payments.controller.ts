import { Controller, Get, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

/**
 * PaymentsController
 * API endpoints for managing payments.
 */
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('booking/:bookingId')
  processPayment(
    @Param('bookingId') bookingId: string,
    @Body('method') method: string,
    @Body('amount') amount: number
  ) {
    const id = +bookingId;
    if (isNaN(id)) {
      throw new BadRequestException('bookingId must be a valid number');
    }
    return this.paymentsService.processPayment(id, method, amount);
  }

  @Get('booking/:bookingId')
  getPayment(@Param('bookingId') bookingId: string) {
    const id = +bookingId;
    if (isNaN(id)) {
      throw new BadRequestException('bookingId must be a valid number');
    }
    return this.paymentsService.getPaymentByBooking(id);
  }
}
