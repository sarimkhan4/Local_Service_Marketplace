import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ResourceOwnerGuard } from '../../common/guards/resource-owner.guard';
import { SavedServicesService } from './saved-services.service';

/**
 * SavedServicesController
 * API endpoints for managing customer saved services and providers.
 */
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
@Controller('saved-services')
export class SavedServicesController {
  constructor(private readonly savedServicesService: SavedServicesService) {}

  @Post()
  async saveService(
    @Body('customerId') customerId: number,
    @Body('serviceId') serviceId?: number,
    @Body('providerId') providerId?: number,
    @Body('notes') notes?: string,
  ) {
    if (!serviceId && !providerId) {
      throw new Error('Either serviceId or providerId must be provided');
    }
    return this.savedServicesService.saveService(customerId, serviceId, providerId, notes);
  }

  @Get('customer/:customerId')
  async getCustomerSavedServices(@Param('customerId') customerId: string) {
    const id = +customerId;
    return this.savedServicesService.getCustomerSavedServices(id);
  }

  @Delete(':savedServiceId/customer/:customerId')
  async removeSavedService(
    @Param('savedServiceId') savedServiceId: string,
    @Param('customerId') customerId: string,
  ) {
    const savedId = +savedServiceId;
    const custId = +customerId;
    await this.savedServicesService.removeSavedService(custId, savedId);
    return { message: 'Saved service removed successfully' };
  }

  @Get('customer/:customerId/check')
  async checkIfSaved(
    @Param('customerId') customerId: string,
    @Body('serviceId') serviceId?: number,
    @Body('providerId') providerId?: number,
  ) {
    const id = +customerId;
    const isSaved = await this.savedServicesService.isSaved(id, serviceId, providerId);
    return { isSaved };
  }
}
