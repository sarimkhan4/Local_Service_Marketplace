import { DataSource } from 'typeorm';
import { Booking } from '../../entities/booking.entity';
import { BookingService } from '../../entities/booking-service.entity';

export const bookingsProviders = [
  {
    provide: 'BOOKING_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Booking),
    inject: ['DATABASE_SOURCE'],
  },
  {
    provide: 'BOOKING_SERVICE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(BookingService),
    inject: ['DATABASE_SOURCE'],
  },
];
