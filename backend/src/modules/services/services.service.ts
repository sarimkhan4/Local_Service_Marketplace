import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { ProviderService } from '../../entities/provider-service.entity';

/**
 * ServicesService
 * Manages generic services and custom ProviderService configurations.
 * Aligns with the ER diagram's M:N pricing linkage.
 */
@Injectable()
export class ServicesService {
  constructor(
    @Inject('SERVICE_REPOSITORY')
    private serviceRepository: Repository<Service>,
    @Inject('PROVIDER_SERVICE_REPOSITORY')
    private providerServiceRepository: Repository<ProviderService>,
  ) {}

  /**
   * Fetch all global services with category
   */
  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({ relations: ['category'] });
  }

  /**
   * Fetch specific global service
   */
  async findById(id: number): Promise<Service | null> {
    return this.serviceRepository.findOne({ 
      where: { serviceId: id },
      relations: ['category']
    });
  }

  /**
   * Admin: create a new generic service
   */
  async create(data: Partial<Service>): Promise<Service> {
    const newService = this.serviceRepository.create(data);
    return this.serviceRepository.save(newService);
  }

  /**
   * Provider: Links a provider to a service with a specific price
   */
  async addProviderService(providerId: number, serviceId: number, price: number): Promise<ProviderService> {
    const newProviderService = this.providerServiceRepository.create({
      provider: { userId: providerId } as any,
      service: { serviceId: serviceId } as any,
      price: price
    });
    return this.providerServiceRepository.save(newProviderService);
  }

  /**
   * Fetch all services offered by a specific provider (with custom prices)
   */
  async getServicesByProvider(providerId: number): Promise<ProviderService[]> {
    return this.providerServiceRepository.find({
      where: { provider: { userId: providerId } },
      relations: ['service', 'service.category']
    });
  }

  /**
   * Fetch all provider services globally (for customer browsing)
   */
  async getAllProviderServices(): Promise<ProviderService[]> {
    return this.providerServiceRepository.find({
      relations: ['service', 'service.category', 'provider']
    });
  }

  /**
   * Bulk save provider services
   */
  async bulkSaveProviderServices(providerId: number, services: { serviceId: number, price: number }[]) {
    // Remove existing
    await this.providerServiceRepository.delete({ provider: { userId: providerId } });
    
    // Insert new
    if (services && services.length > 0) {
      const newProviderServices = services.map(s => this.providerServiceRepository.create({
        provider: { userId: providerId } as any,
        service: { serviceId: s.serviceId } as any,
        price: s.price
      }));
      return this.providerServiceRepository.save(newProviderServices);
    }
    return [];
  }
}
