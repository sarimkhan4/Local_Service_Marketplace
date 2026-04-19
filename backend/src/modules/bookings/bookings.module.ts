import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { bookingsProviders } from './bookings.provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BookingsController],
  providers: [
    ...bookingsProviders,
    BookingsService
  ],
  exports: [BookingsService]
})
export class BookingsModule {}
