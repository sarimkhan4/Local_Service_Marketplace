import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { notificationProviders } from './notification.provider';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
    imports: [DatabaseModule],
    controllers: [NotificationController],
    providers: [
        ...notificationProviders,
        NotificationService,
    ],
    exports: [NotificationService],
})
export class NotificationModule { }
