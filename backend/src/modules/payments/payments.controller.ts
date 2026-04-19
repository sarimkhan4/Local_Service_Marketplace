import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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
    return this.paymentsService.processPayment(+bookingId, method, amount);
  }

  @Get('booking/:bookingId')
  getPayment(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getPaymentByBooking(+bookingId);
  }
}
