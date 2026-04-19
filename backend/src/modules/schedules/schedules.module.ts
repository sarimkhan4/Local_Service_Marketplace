import { Module } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { schedulesProviders } from './schedules.provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SchedulesController],
  providers: [
    ...schedulesProviders,
    SchedulesService
  ],
  exports: [SchedulesService]
})
export class SchedulesModule {}
