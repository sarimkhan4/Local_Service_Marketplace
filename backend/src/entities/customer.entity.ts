import { ChildEntity } from 'typeorm';
import { User } from './user.entity';

/**
 * Customer Entity
 * Inherits from User. Represents users who request and create bookings.
 */
@ChildEntity('CUSTOMER')
export class Customer extends User {
}
