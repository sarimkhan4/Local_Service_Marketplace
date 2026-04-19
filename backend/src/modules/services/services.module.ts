import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { servicesProviders } from './services.provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ServicesController],
  providers: [
    ...servicesProviders,
    ServicesService
  ],
  exports: [ServicesService]
})
export class ServicesModule {}
