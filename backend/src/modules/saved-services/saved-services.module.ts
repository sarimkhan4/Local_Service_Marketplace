import { Module } from '@nestjs/common';
import { SavedService } from '../../entities/saved-service.entity';
import { SavedServicesService } from './saved-services.service';
import { SavedServicesController } from './saved-services.controller';
import { DatabaseModule } from '../database/database.module';

export const savedServicesProviders = [
  {
    provide: 'SAVED_SERVICE_REPOSITORY',
    useFactory: (dataSource) => dataSource.getRepository(SavedService),
    inject: ['DATABASE_SOURCE'],
  },
];

@Module({
  imports: [DatabaseModule],
  controllers: [SavedServicesController],
  providers: [
    ...savedServicesProviders,
    SavedServicesService
  ],
  exports: [SavedServicesService]
})
export class SavedServicesModule {}
