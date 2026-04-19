import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';

/**
 * Provider Entity
 * Inherits from User. Represents service providers offering their skills.
 */
@ChildEntity('PROVIDER')
export class Provider extends User {
  // Years of experience (or similar metric) specific to providers
  @Column({ type: 'int', nullable: true })
  experience: number;
}
