import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { addressesProviders } from './addresses.provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AddressesController],
  providers: [
    ...addressesProviders,
    AddressesService
  ],
  exports: [AddressesService]
})
export class AddressesModule {}
