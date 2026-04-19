import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ServicesService } from './services.service';

/**
 * ServicesController
 * Exposes API endpoints for services and provider pricing.
 */
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  getAllServices() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  getService(@Param('id') id: string) {
    return this.servicesService.findById(+id);
  }

  @Post()
  createService(@Body() data: any) {
    return this.servicesService.create(data);
  }

  // --- ProviderService logic ---

  @Post('provider/:providerId')
  addProviderService(
    @Param('providerId') providerId: string,
    @Body('serviceId') serviceId: number,
    @Body('price') price: number
  ) {
    return this.servicesService.addProviderService(+providerId, serviceId, price);
  }

  @Get('provider/:providerId')
  getServicesByProvider(@Param('providerId') providerId: string) {
    return this.servicesService.getServicesByProvider(+providerId);
  }
}
