import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';

/**
 * ReviewsService
 * Handles customer reviews for a specific booking.
 * Aligns with the 1:1 ER diagram relation between Booking and Review.
 */
@Injectable()
export class ReviewsService {
  constructor(
    @Inject('REVIEW_REPOSITORY')
    private reviewRepository: Repository<Review>,
  ) {}

  /**
   * Leave a review for a booking
   */
  async leaveReview(bookingId: number, rating: number, comment: string): Promise<Review> {
    const review = this.reviewRepository.create({
      booking: { bookingId } as any,
      rating,
      comment
    });
    return this.reviewRepository.save(review);
  }

  /**
   * Get a review by booking ID
   */
  async getReviewByBooking(bookingId: number): Promise<Review | null> {
    return this.reviewRepository.findOneBy({ booking: { bookingId } as any });
  }
}
