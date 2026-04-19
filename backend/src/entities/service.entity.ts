import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './category.entity';

/**
 * Service Entity
 * Represents a generic type of service offered in the system.
 */
@Entity('services')
export class Service {
  @PrimaryGeneratedColumn({ name: 'service_id' })
  serviceId: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Each service belongs to one category
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
