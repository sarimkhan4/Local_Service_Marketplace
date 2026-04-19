import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Customer } from '../../entities/customer.entity';
import { Provider } from '../../entities/provider.entity';

/**
 * UsersService
 * Handles core business logic for Users, Customers, and Providers.
 * Aligns with the ISA (Disjoint, Total) relationship from the ER Diagram.
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('CUSTOMER_REPOSITORY')
    private customerRepository: Repository<Customer>,
    @Inject('PROVIDER_REPOSITORY')
    private providerRepository: Repository<Provider>,
  ) {}

  /**
   * Fetch all users regardless of role
   */
  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Fetch only customers
   */
  async findAllCustomers(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  /**
   * Fetch only providers
   */
  async findAllProviders(): Promise<Provider[]> {
    return this.providerRepository.find();
  }

  /**
   * Fetch a specific user by ID
   */
  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ userId: id });
  }

  /**
   * Fetch user by email including hidden password field (for Auth)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['userId', 'email', 'password', 'name', 'role' as any]
    });
  }

  /**
   * Register a new Customer
   */
  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const customer = this.customerRepository.create(data);
    return this.customerRepository.save(customer);
  }

  /**
   * Register a new Provider
   */
  async createProvider(data: Partial<Provider>): Promise<Provider> {
    const provider = this.providerRepository.create(data);
    return this.providerRepository.save(provider);
  }
}
