import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
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
    try {
      // Check if review already exists for this booking
      const existingReview = await this.reviewRepository.findOne({
        where: { bookingId }
      });
      
      if (existingReview) {
        throw new ConflictException('Review already exists for this booking');
      }
      
      const review = this.reviewRepository.create({
        bookingId,
        rating,
        comment
      });
      
      return this.reviewRepository.save(review);
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Get a review by booking ID
   */
  async getReviewByBooking(bookingId: number): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { bookingId },
      relations: ['booking', 'booking.provider', 'booking.customer'],
    });
  }

  /**
   * Get all reviews for a specific provider
   */
  async getProviderReviews(providerId: number): Promise<Review[]> {
    console.log(`[ReviewsService] Fetching reviews for provider ID: ${providerId}`);
    
    try {
      const reviews = await this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.booking', 'booking')
        .leftJoinAndSelect('booking.provider', 'provider')
        .leftJoinAndSelect('booking.customer', 'customer')
        .where('provider.userId = :providerId', { providerId })
        .orderBy('review.createdAt', 'DESC')
        .getMany();
      
      console.log(`[ReviewsService] Found ${reviews.length} reviews for provider ${providerId}`);
      return reviews;
    } catch (error) {
      console.error('[ReviewsService] Error fetching provider reviews:', error);
      throw error;
    }
  }
}
