import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { SchedulesService } from './schedules.service';

/**
 * SchedulesController
 * Exposes API endpoints for managing provider schedules.
 */
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post('provider/:providerId')
  addSlot(
    @Param('providerId') providerId: string,
    @Body('date') date: Date,
    @Body('timeSlot') timeSlot: string
  ) {
    return this.schedulesService.addSlot(+providerId, date, timeSlot);
  }

  @Get('provider/:providerId')
  getProviderSchedule(@Param('providerId') providerId: string) {
    return this.schedulesService.getProviderSchedule(+providerId);
  }

  @Delete(':scheduleId')
  deleteSlot(@Param('scheduleId') scheduleId: string) {
    return this.schedulesService.deleteSlot(+scheduleId);
  }
}
