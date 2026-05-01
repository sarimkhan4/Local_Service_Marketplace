import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Service } from './service.entity';
import { Provider } from './provider.entity';

/**
 * SavedService Entity
 * Allows customers to save services and providers for later reference.
 */
@Entity('saved_services')
export class SavedService {
  @PrimaryGeneratedColumn({ name: 'saved_service_id' })
  savedServiceId: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ name: 'service_id', nullable: true })
  serviceId: number;

  @Column({ name: 'provider_id', nullable: true })
  providerId: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Customer, customer => customer.userId)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Service, service => service.serviceId)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Provider, provider => provider.userId)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
