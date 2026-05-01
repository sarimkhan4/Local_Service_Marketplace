import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { DataService, CatalogService, CatalogProvider } from '../../../core/services/data.service';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    ButtonModule, DialogModule, TagModule,
    InputTextModule, ChipModule, AvatarModule, DividerModule,
    SkeletonModule, MessageModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.css'
})
export class ServiceDetail implements OnInit {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private messageService = inject(MessageService);

  service: CatalogService | undefined;
  loadingProviders = signal(false);
  bookingMessage = signal<{severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string} | null>(null);

  // ── Booking dialog state ──
  bookingVisible = false;
  selectedProvider: CatalogProvider | null = null;
  bookingDate = '';
  bookingTime = '';
  bookingNotes = '';
  bookingSuccess = signal(false);
  bookingLoading = signal(false);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      if (this.dataService.catalogServices.length === 0) {
        await this.dataService.loadCatalogServices();
      }
      this.service = this.dataService.getServiceById(id);
      
      if (this.service) {
        this.titleService.setTitle('Local Service Management System | ' + this.service.title);
        
        // Start skeleton loader
        this.loadingProviders.set(true);
        try {
          const listings: any[] = await lastValueFrom(
            this.http.get<any[]>(`${environment.apiUrl}/services/listings`)
          );
          
          this.service.providers = listings
            .filter(ps => ps.service?.serviceId?.toString() === id)
            .map(ps => ({
              id: ps.provider?.userId?.toString() || '0',
              name: ps.provider?.name || 'Unknown',
              companyName: ps.provider?.companyName || 'Independent',
              rating: 4.8,
              reviews: 12,
              yearsExperience: ps.provider?.experience || 0,
              price: Number(ps.price),
              bio: ps.provider?.bio || 'Local professional ready to help.'
            }));
        } catch (e) {
          console.error('Failed to load listings', e);
        } finally {
          // Stop skeleton loader
          this.loadingProviders.set(false);
        }
      }
    }
  }

  openBooking(provider: CatalogProvider) {
    this.selectedProvider = provider;
    this.bookingDate = '';
    this.bookingTime = '';
    this.bookingNotes = '';
    this.bookingSuccess.set(false);
    this.bookingVisible = true;
  }

  async confirmBooking() {
    if (!this.selectedProvider || !this.bookingDate || !this.bookingTime || !this.service) {
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Authentication Required',
        detail: 'Please login to book a service'
      });
      return;
    }

    this.bookingLoading.set(true);

    try {
      const dateStr = `${this.bookingDate}T${this.bookingTime}:00Z`;
      
      // Create booking via API
      const bookingData = {
        customerId: currentUser.id,
        providerId: this.selectedProvider.id,
        serviceId: this.service.id,
        date: dateStr,
        notes: this.bookingNotes,
        totalAmount: this.selectedProvider.price
      };

      const booking = await lastValueFrom(this.apiService.createBooking(bookingData)) as any;
      
      // Create dynamic notification for customer
      this.notificationService.createBookingNotification(
        'booking_new',
        booking.bookingId?.toString() || 'unknown',
        this.service.title,
        this.selectedProvider.name,
        'Customer'
      );
      
      this.bookingSuccess.set(true);
      this.messageService.add({
        severity: 'success',
        summary: 'Booking Confirmed!',
        detail: `Your booking with ${this.selectedProvider.name} has been created successfully.`
      });

      // Redirect to bookings after a short delay
      setTimeout(() => {
        this.bookingVisible = false;
        this.goToBookings();
      }, 2000);

    } catch (error: any) {
      console.error('Booking failed:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Booking Failed',
        detail: error.error?.message || 'Failed to create booking. Please try again.'
      });
    } finally {
      this.bookingLoading.set(false);
    }
  }

  goToCheckout() {
    this.bookingVisible = false;
    this.router.navigate(['/app/customer/checkout']);
  }

  goToBookings() {
    this.router.navigate(['/app/customer/bookings']);
  }

  onDialogHide() {
    // Reset form when dialog is hidden
    this.selectedProvider = null;
    this.bookingDate = '';
    this.bookingTime = '';
    this.bookingNotes = '';
    this.bookingSuccess.set(false);
  }

  goBack() {
    this.router.navigate(['/app/customer/services']);
  }

  get canConfirm(): boolean {
    return !!(this.bookingDate && this.bookingTime);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  async saveProvider(provider: CatalogProvider) {
    try {
      await this.dataService.saveService(undefined, +provider.id, 'Saved from service detail page');
      // Show success message or update UI
    } catch (error) {
      console.error('Failed to save provider:', error);
    }
  }

  getRatingStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
}
