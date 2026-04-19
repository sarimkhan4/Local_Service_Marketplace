import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { NotificationType } from '../common/enums/notification_type.enum';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn({ name: 'notification_id' })
    notificationId: number;

    @Column({ name: 'title' })
    title: string;

    @Column({ name: 'message', type: 'text' })
    message: string;

    @Column({
        name: 'notification_type',
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.SYSTEM_ALERT,
    })
    type: NotificationType;

    @Column({ name: 'is_read', default: false })
    isRead: boolean;

    @Column({ name: 'is_sent', default: true })
    isSent: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User)
    user: User;
}