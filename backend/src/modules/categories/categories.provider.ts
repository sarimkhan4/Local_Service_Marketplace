import { DataSource } from 'typeorm';
import { Category } from '../../entities/category.entity';

export const categoriesProviders = [
  {
    provide: 'CATEGORY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Category),
    inject: ['DATABASE_SOURCE'],
  },
];
