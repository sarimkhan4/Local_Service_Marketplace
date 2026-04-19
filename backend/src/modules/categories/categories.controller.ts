import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

/**
 * CategoriesController
 * Exposes endpoints for managing categories.
 */
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAllCategories() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  getCategory(@Param('id') id: string) {
    return this.categoriesService.findById(+id);
  }

  @Post()
  createCategory(@Body() data: any) {
    return this.categoriesService.create(data);
  }
}
