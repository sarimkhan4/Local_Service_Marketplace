import { DataSource } from 'typeorm';
import { Schedule } from '../../entities/schedule.entity';

export const schedulesProviders = [
  {
    provide: 'SCHEDULE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Schedule),
    inject: ['DATABASE_SOURCE'],
  },
];
