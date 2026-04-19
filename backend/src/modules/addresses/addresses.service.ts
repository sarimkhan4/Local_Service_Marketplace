import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Address } from '../../entities/address.entity';

/**
 * AddressesService
 * Manages user addresses.
 * Aligns with the 1:N ER diagram relation between User and Address.
 */
@Injectable()
export class AddressesService {
  constructor(
    @Inject('ADDRESS_REPOSITORY')
    private addressRepository: Repository<Address>,
  ) {}

  /**
   * Add a new address for a user
   */
  async addAddress(userId: number, data: Partial<Address>): Promise<Address> {
    const address = this.addressRepository.create({
      ...data,
      user: { userId } as any
    });
    return this.addressRepository.save(address);
  }

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId: number): Promise<Address[]> {
    return this.addressRepository.find({ where: { user: { userId } as any } });
  }

  /**
   * Update an address
   */
  async updateAddress(addressId: number, data: Partial<Address>): Promise<Address> {
    await this.addressRepository.update(addressId, data);
    return this.addressRepository.findOneBy({ addressId }) as Promise<Address>;
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId: number): Promise<void> {
    await this.addressRepository.delete(addressId);
  }
}
