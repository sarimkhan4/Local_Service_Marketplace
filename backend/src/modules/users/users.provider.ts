import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Customer } from '../../entities/customer.entity';
import { Provider } from '../../entities/provider.entity';

export const usersProviders = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATABASE_SOURCE'],
  },
  {
    provide: 'CUSTOMER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Customer),
    inject: ['DATABASE_SOURCE'],
  },
  {
    provide: 'PROVIDER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Provider),
    inject: ['DATABASE_SOURCE'],
  },
];
