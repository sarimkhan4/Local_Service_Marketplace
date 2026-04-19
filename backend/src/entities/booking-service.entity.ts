import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Booking } from './booking.entity';
import { Service } from './service.entity';

/**
 * BookingService Entity
 * Represents the M:N junction between Bookings and Services.
 * Includes the status of individual services within a booking.
 */
@Entity('booking_services')
export class BookingService {
  @PrimaryGeneratedColumn({ name: 'booking_service_id' })
  bookingServiceId: number;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  // Custom attribute indicating if this particular service is completed
  @Column({ name: 'service_status', length: 50, default: 'PENDING' })
  serviceStatus: string;
}
