import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Category Entity
 * Groups related services together (e.g., 'Plumbing', 'Cleaning').
 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'category_name', length: 100 })
  categoryName: string;
}
