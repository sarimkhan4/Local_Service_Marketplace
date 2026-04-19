import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Provider } from './provider.entity';
import { Service } from './service.entity';

/**
 * ProviderService Entity
 * Represents the M:N junction between Providers and Services.
 * Essential because it stores the specific 'price' a provider charges for a service.
 */
@Entity('provider_services')
export class ProviderService {
  @PrimaryGeneratedColumn({ name: 'provider_service_id' })
  providerServiceId: number;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  // The custom attribute indicating this provider's rate for this service
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
