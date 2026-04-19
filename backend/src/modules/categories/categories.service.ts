import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';

/**
 * CategoriesService
 * Manages the service categories grouping logic.
 */
@Injectable()
export class CategoriesService {
  constructor(
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
  ) {}

  /**
   * Fetch all service categories
   */
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  /**
   * Fetch a category by ID
   */
  async findById(id: number): Promise<Category | null> {
    return this.categoryRepository.findOneBy({ categoryId: id });
  }

  /**
   * Create a new category
   */
  async create(data: Partial<Category>): Promise<Category> {
    const newCategory = this.categoryRepository.create(data);
    return this.categoryRepository.save(newCategory);
  }
}
