import { SavedService } from '../../entities/saved-service.entity';

export const savedServicesProviders = [
  {
    provide: 'SAVED_SERVICE_REPOSITORY',
    useFactory: (dataSource) => dataSource.getRepository(SavedService),
    inject: ['DATA_SOURCE'],
  },
];
