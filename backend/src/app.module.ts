import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { NotificationModule } from './modules/notification/notification.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ServicesModule } from './modules/services/services.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SavedServicesModule } from './modules/saved-services/saved-services.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make env variables accessible globally
    }),
    DatabaseModule, NotificationModule, UsersModule, AuthModule, AddressesModule, CategoriesModule, ServicesModule, SchedulesModule, BookingsModule, PaymentsModule, ReviewsModule, SavedServicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
