import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Schedule } from '../../entities/schedule.entity';

/**
 * SchedulesService
 * Manages provider availability schedules.
 * Aligns with the ER diagram where a Provider has multiple Schedule slots.
 */
@Injectable()
export class SchedulesService {
  constructor(
    @Inject('SCHEDULE_REPOSITORY')
    private scheduleRepository: Repository<Schedule>,
  ) {}

  /**
   * Add a new availability slot for a provider
   */
  async addSlot(providerId: number, date: Date, timeSlot: string): Promise<Schedule> {
    const newSlot = this.scheduleRepository.create({
      provider: { userId: providerId } as any,
      date,
      timeSlot
    });
    return this.scheduleRepository.save(newSlot);
  }

  /**
   * Get all availability slots for a specific provider
   */
  async getProviderSchedule(providerId: number): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: { provider: { userId: providerId } },
      order: { date: 'ASC' }
    });
  }

  /**
   * Delete a specific availability slot
   */
  async deleteSlot(scheduleId: number): Promise<void> {
    await this.scheduleRepository.delete(scheduleId);
  }
}
