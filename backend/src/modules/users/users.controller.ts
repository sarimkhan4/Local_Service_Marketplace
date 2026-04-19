import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * UsersController
 * Exposes REST APIs for managing Users, Customers, and Providers.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get('customers')
  getAllCustomers() {
    return this.usersService.findAllCustomers();
  }

  @Get('providers')
  getAllProviders() {
    return this.usersService.findAllProviders();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findUserById(+id);
  }

  @Post('customer')
  createCustomer(@Body() data: any) {
    return this.usersService.createCustomer(data);
  }

  @Post('provider')
  createProvider(@Body() data: any) {
    return this.usersService.createProvider(data);
  }
}
