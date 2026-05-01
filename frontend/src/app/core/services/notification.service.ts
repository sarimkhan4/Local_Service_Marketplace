import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';

export type NotificationType =
  | 'booking_new'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'review_received'
  | 'payment_received'
  | 'schedule_reminder'
  | 'message_received'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedEntityId?: string;
  avatarLabel?: string;
  avatarColor?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiService = inject(ApiService);

  private _customerNotifications = signal<AppNotification[]>([]);

  private _providerNotifications = signal<AppNotification[]>([]);

  customerUnreadCount = computed(() => this._customerNotifications().filter(n => !n.isRead).length);
  providerUnreadCount = computed(() => this._providerNotifications().filter(n => !n.isRead).length);

  get customerNotifications() { return this._customerNotifications; }
  get providerNotifications() { return this._providerNotifications; }

  async loadNotifications(userId: string, role: 'Customer' | 'Provider') {
    this.apiService.getUserNotifications(userId).subscribe((data: any) => {
      const formatted = data.map((n: any) => ({
        id: n.notificationId.toString(),
        type: n.type || 'system',
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: new Date(n.createdAt),
        avatarLabel: 'Sys',
        avatarColor: '#14b8a6'
      }));

      if (role === 'Customer') {
        this._customerNotifications.set(formatted);
      } else {
        this._providerNotifications.set(formatted);
      }
    });
  }

  markCustomerRead(id: string) {
    this._customerNotifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
  }
  markProviderRead(id: string) {
    this._providerNotifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
  }
  markAllCustomerRead() {
    this._customerNotifications.update(list => list.map(n => ({ ...n, isRead: true })));
  }
  markAllProviderRead() {
    this._providerNotifications.update(list => list.map(n => ({ ...n, isRead: true })));
  }
  deleteCustomerNotification(id: string) {
    this._customerNotifications.update(list => list.filter(n => n.id !== id));
  }
  deleteProviderNotification(id: string) {
    this._providerNotifications.update(list => list.filter(n => n.id !== id));
  }

  getIconForType(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      booking_new: 'pi pi-calendar-plus',
      booking_confirmed: 'pi pi-check-circle',
      booking_cancelled: 'pi pi-times-circle',
      booking_completed: 'pi pi-verified',
      review_received: 'pi pi-star-fill',
      payment_received: 'pi pi-dollar',
      schedule_reminder: 'pi pi-clock',
      message_received: 'pi pi-envelope',
      system: 'pi pi-info-circle',
    };
    return map[type] ?? 'pi pi-bell';
  }

  getTimeAgo(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  }

  // Dynamic notification creation methods
  createBookingNotification(type: 'booking_new' | 'booking_confirmed' | 'booking_cancelled' | 'booking_completed', 
                          bookingId: string, serviceName: string, providerName: string, role: 'Customer' | 'Provider') {
    const notifications = this[role === 'Customer' ? '_customerNotifications' : '_providerNotifications'];
    const newNotification: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: this.getNotificationTitle(type),
      message: this.getNotificationMessage(type, serviceName, providerName, role),
      isRead: false,
      createdAt: new Date(),
      relatedEntityId: bookingId,
      avatarLabel: role === 'Customer' ? this.getInitials(providerName) : 'Sys',
      avatarColor: this.getRandomColor(providerName)
    };
    
    notifications.update(list => [newNotification, ...list]);
  }

  createReviewNotification(serviceName: string, customerName: string, rating: number, role: 'Provider') {
    if (role !== 'Provider') return;
    
    const newNotification: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'review_received',
      title: 'New Review Received',
      message: `${customerName} left a ${rating}-star review for ${serviceName}`,
      isRead: false,
      createdAt: new Date(),
      avatarLabel: this.getInitials(customerName),
      avatarColor: this.getRandomColor(customerName)
    };
    
    this._providerNotifications.update(list => [newNotification, ...list]);
  }

  createPaymentNotification(amount: number, serviceName: string, role: 'Customer' | 'Provider') {
    const notifications = this[role === 'Customer' ? '_customerNotifications' : '_providerNotifications'];
    const newNotification: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'payment_received',
      title: 'Payment Processed',
      message: `Payment of $${amount} processed for ${serviceName}`,
      isRead: false,
      createdAt: new Date(),
      avatarLabel: '$',
      avatarColor: '#22c55e'
    };
    
    notifications.update(list => [newNotification, ...list]);
  }

  private getNotificationTitle(type: NotificationType): string {
    const titles: Record<NotificationType, string> = {
      booking_new: 'New Booking',
      booking_confirmed: 'Booking Confirmed',
      booking_cancelled: 'Booking Cancelled',
      booking_completed: 'Booking Completed',
      review_received: 'New Review',
      payment_received: 'Payment Processed',
      schedule_reminder: 'Schedule Reminder',
      message_received: 'New Message',
      system: 'System Notification'
    };
    return titles[type] || 'Notification';
  }

  private getNotificationMessage(type: NotificationType, serviceName: string, providerName: string, role: 'Customer' | 'Provider'): string {
    if (role === 'Customer') {
      const customerMessages: Record<NotificationType, string> = {
        booking_new: `Your booking for ${serviceName} has been created`,
        booking_confirmed: `Your booking for ${serviceName} has been confirmed by ${providerName}`,
        booking_cancelled: `Your booking for ${serviceName} has been cancelled`,
        booking_completed: `Your booking for ${serviceName} has been completed`,
        review_received: 'Thank you for your review',
        payment_received: `Payment processed for ${serviceName}`,
        schedule_reminder: `Reminder: Your ${serviceName} appointment is coming up`,
        message_received: `You have a new message regarding ${serviceName}`,
        system: `System update regarding ${serviceName}`
      };
      return customerMessages[type] || `Update regarding ${serviceName}`;
    } else {
      const providerMessages: Record<NotificationType, string> = {
        booking_new: `New booking request for ${serviceName}`,
        booking_confirmed: `Booking for ${serviceName} has been confirmed`,
        booking_cancelled: `Booking for ${serviceName} has been cancelled`,
        booking_completed: `Booking for ${serviceName} has been completed`,
        review_received: `New review received for ${serviceName}`,
        payment_received: `Payment received for ${serviceName}`,
        schedule_reminder: `Reminder: ${serviceName} appointment scheduled`,
        message_received: `New message about ${serviceName}`,
        system: `System update regarding ${serviceName}`
      };
      return providerMessages[type] || `Update regarding ${serviceName}`;
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  private getRandomColor(name: string = ''): string {
    const colors = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e', '#ec4899'];
    const index = name.length > 0 ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }
}
