import { DataSource } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { ProviderService } from '../../entities/provider-service.entity';

export const servicesProviders = [
  {
    provide: 'SERVICE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Service),
    inject: ['DATABASE_SOURCE'],
  },
  {
    provide: 'PROVIDER_SERVICE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProviderService),
    inject: ['DATABASE_SOURCE'],
  },
];
