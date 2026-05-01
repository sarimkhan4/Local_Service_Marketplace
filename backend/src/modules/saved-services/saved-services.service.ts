import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SavedService } from '../../entities/saved-service.entity';

/**
 * SavedServicesService
 * Handles customer saved services and providers.
 */
@Injectable()
export class SavedServicesService {
  constructor(
    @Inject('SAVED_SERVICE_REPOSITORY')
    private savedServiceRepository: Repository<SavedService>,
  ) {}

  /**
   * Save a service or provider for a customer
   */
  async saveService(customerId: number, serviceId?: number, providerId?: number, notes?: string): Promise<SavedService> {
    // Check if already saved
    const existing = await this.savedServiceRepository.findOne({
      where: {
        customerId,
        ...(serviceId && { serviceId }),
        ...(providerId && { providerId }),
      },
    });

    if (existing) {
      return existing;
    }

    const savedService = this.savedServiceRepository.create({
      customerId,
      serviceId,
      providerId,
      notes,
    });
    return this.savedServiceRepository.save(savedService);
  }

  /**
   * Get all saved services for a customer
   */
  async getCustomerSavedServices(customerId: number): Promise<SavedService[]> {
    return this.savedServiceRepository.find({
      where: { customerId },
      relations: ['service', 'provider', 'service.category'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Remove a saved service
   */
  async removeSavedService(customerId: number, savedServiceId: number): Promise<void> {
    await this.savedServiceRepository.delete({
      savedServiceId,
      customerId,
    });
  }

  /**
   * Check if a service or provider is saved by a customer
   */
  async isSaved(customerId: number, serviceId?: number, providerId?: number): Promise<boolean> {
    const existing = await this.savedServiceRepository.findOne({
      where: {
        customerId,
        ...(serviceId && { serviceId }),
        ...(providerId && { providerId }),
      },
    });
    return !!existing;
  }
}
