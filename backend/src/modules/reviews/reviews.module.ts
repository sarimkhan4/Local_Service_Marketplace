import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { reviewsProviders } from './reviews.provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ReviewsController],
  providers: [
    ...reviewsProviders,
    ReviewsService
  ],
  exports: [ReviewsService]
})
export class ReviewsModule {}
