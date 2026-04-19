import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { NotificationType } from '../../common/enums/notification_type.enum';

@Injectable()
export class NotificationService {
    constructor(
        @Inject('NOTIFICATION_REPOSITORY')
        private notificationRepository: Repository<Notification>,
    ) { }

    async sendNotification(
        user: User,
        title: string,
        message: string,
        type: NotificationType
    ): Promise<Notification> {
        const newNotification = this.notificationRepository.create({
            title,
            message,
            type,
            user,
            isRead: false,
            isSent: true,
        });

        return await this.notificationRepository.save(newNotification);
    }

    async getNotificationsByUser(userId: number): Promise<Notification[]> {
        return await this.notificationRepository.find({
            where: { user: { userId: userId } },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(notificationId: number): Promise<void> {
        await this.notificationRepository.update(notificationId, { isRead: true });
    }
}