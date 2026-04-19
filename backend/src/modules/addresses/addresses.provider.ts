import { DataSource } from 'typeorm';
import { Address } from '../../entities/address.entity';

export const addressesProviders = [
  {
    provide: 'ADDRESS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Address),
    inject: ['DATABASE_SOURCE'],
  },
];
