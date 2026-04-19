import { DataSource } from 'typeorm';
import { Payment } from '../../entities/payment.entity';

export const paymentsProviders = [
  {
    provide: 'PAYMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Payment),
    inject: ['DATABASE_SOURCE'],
  },
];
