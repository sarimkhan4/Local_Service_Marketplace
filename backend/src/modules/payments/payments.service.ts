import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';

/**
 * PaymentsService
 * Handles payment status updates.
 * Aligns with the 1:1 ER diagram relation between Booking and Payment.
 */
@Injectable()
export class PaymentsService {
  constructor(
    @Inject('PAYMENT_REPOSITORY')
    private paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Process a payment for a booking
   */
  async processPayment(bookingId: number, method: string, amount: number): Promise<Payment> {
    const payment = this.paymentRepository.create({
      booking: { bookingId } as any,
      method,
      amount,
      paymentStatus: 'PAID'
    });
    return this.paymentRepository.save(payment);
  }

  /**
   * Get payment details by booking ID
   */
  async getPaymentByBooking(bookingId: number): Promise<Payment | null> {
    return this.paymentRepository.findOneBy({ booking: { bookingId } as any });
  }
}
