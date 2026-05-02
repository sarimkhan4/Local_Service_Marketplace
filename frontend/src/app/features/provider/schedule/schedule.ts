import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface ScheduleBooking {
  id: string;
  customerName: string;
  customerInitials: string;
  avatarColor: string;
  serviceName: string;
  date: string;       // ISO date YYYY-MM-DD
  time: string;       // HH:MM
  duration: number;   // minutes
  status: BookingStatus;
  notes: string;
  price: number;
  address: string;
}

interface ProviderBookingApiResponse {
  bookingId: number | string;
  date: string;
  status: string;
  totalAmount: number | string;
  customer?: {
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  services?: Array<{
    duration?: number;
    service?: {
      name?: string;
    };
  }>;
  address?: {
    street?: string;
    city?: string;
  };
}

function apiToScheduleStatus(raw: string | undefined): BookingStatus {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  if (s === 'PENDING') return 'Pending';
  if (s === 'CONFIRMED' || s === 'IN_PROGRESS') return 'Confirmed';
  if (s === 'COMPLETED' || s === 'COMPLETE') return 'Completed';
  if (s === 'CANCELLED' || s === 'CANCELED') return 'Cancelled';
  return 'Pending';
}

function customerDisplay(c: ProviderBookingApiResponse['customer']): { name: string; initials: string } {
  const fromParts = `${c?.firstName ?? ''} ${c?.lastName ?? ''}`.trim();
  const nameField = typeof c?.name === 'string' ? c.name.trim() : '';
  const name = fromParts || nameField || 'Customer';
  const parts = name.split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (name.slice(0, 2).toUpperCase() || '?');
  return { name, initials };
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, TagModule, DialogModule, InputTextModule,
    SelectModule, TextareaModule, ChipModule,
    AvatarModule, SelectButtonModule, DividerModule, BadgeModule,
    PaginatorModule, TooltipModule, RippleModule
  ],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css'
})
export class Schedule {
  private titleService = inject(Title);

  readonly schRows = 8;
  schPageFirst = signal(0);

  // ── View filter ──
  viewMode: 'all' | 'today' | 'upcoming' | 'past' = 'all';
  viewOptions = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Past', value: 'past' }
  ];

  statusFilter = signal<BookingStatus | 'All'>('All');
  statusOptions = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  bookings = signal<ScheduleBooking[]>([]);

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadBookings();
  }

  async loadBookings() {
    const user = this.authService.currentUser();
    if (!user) return;
    try {
      const data = await lastValueFrom(this.apiService.getProviderBookings(user.id)) as ProviderBookingApiResponse[];
      const mapped = data.map((b): ScheduleBooking => {
        const { name, initials } = customerDisplay(b.customer);
        const slot = new Date(b.date);
        const duration =
          Number((b as { durationMinutes?: number }).durationMinutes) ||
          Number(b.services?.[0]?.duration) ||
          120;
        return {
          id: b.bookingId.toString(),
          customerName: name,
          customerInitials: initials,
          avatarColor: '#14b8a6',
          serviceName: b.services?.[0]?.service?.name || 'Multiple Services',
          date: slot.toISOString().split('T')[0],
          time: slot.toTimeString().substring(0, 5),
          duration,
          status: apiToScheduleStatus(b.status),
          notes: '',
          price: Number(b.totalAmount),
          address:
            `${b.address?.street ?? ''}${b.address?.street && b.address?.city ? ', ' : ''}${b.address?.city ?? ''}`.trim() ||
            'Address not set',
        };
      });
      this.bookings.set(mapped);
      this.schPageFirst.set(0);
    } catch (err) {
      console.error('Failed to load schedule bookings', err);
    }
  }

  // ── Detail / Edit Dialog ──
  showDetailDialog = false;
  selectedBooking: ScheduleBooking | null = null;

  // ── Computed stats ──
  todayCount = computed(() => this.bookings().filter(b => b.date === this.today()).length);
  pendingCount = computed(() => this.bookings().filter(b => b.status === 'Pending').length);
  confirmedCount = computed(() => this.bookings().filter(b => b.status === 'Confirmed').length);
  completedCount = computed(() => this.bookings().filter(b => b.status === 'Completed').length);
  totalRevenue = computed(() => this.bookings().filter(b => b.status === 'Completed').reduce((s, b) => s + b.price, 0));

  filteredBookings = computed(() => {
    let list = this.bookings();
    const todayStr = this.today();

    if (this.viewMode === 'today') list = list.filter(b => b.date === todayStr);
    else if (this.viewMode === 'upcoming') list = list.filter(b => b.date > todayStr);
    else if (this.viewMode === 'past') list = list.filter(b => b.date < todayStr);

    const sf = this.statusFilter();
    if (sf !== 'All') list = list.filter(b => b.status === sf);

    return list.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  });

  pagedBookings = computed(() => {
    const list = this.filteredBookings();
    const first = this.schPageFirst();
    return list.slice(first, first + this.schRows);
  });

  constructor() {
    this.titleService.setTitle('Servicio | Provider Schedule');
  }

  onViewModeChanged(v: typeof this.viewMode) {
    this.viewMode = v;
    this.schPageFirst.set(0);
  }

  onStatusFilterChanged(v: BookingStatus | 'All') {
    this.statusFilter.set(v);
    this.schPageFirst.set(0);
  }

  onSchPageChange(event: { first?: number }) {
    this.schPageFirst.set(event.first ?? 0);
  }

  trackByBookingId(_: number, b: ScheduleBooking): string {
    return b.id;
  }

  // ── Helpers ──
  today(): string { return new Date().toISOString().split('T')[0]; }
  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  /** Stable local calendar parts for list date tile (avoid UTC day shift). */
  calendarSlot(booking: ScheduleBooking): { dow: string; dom: string; sub: string } {
    const d = new Date(booking.date + 'T12:00:00');
    return {
      dow: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dom: String(d.getDate()),
      sub: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
  }
  formatTime(time: string): string {
    const [h, m] = time.split(':');
    const hr = parseInt(h, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const h12 = hr % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }
  formatDuration(mins: number): string {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const r = mins % 60;
    return r > 0 ? `${h}h ${r}m` : `${h}h`;
  }
  isToday(dateStr: string): boolean { return dateStr === this.today(); }

  getStatusSeverity(status: BookingStatus): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    const map: Record<BookingStatus, 'success' | 'warn' | 'danger' | 'info' | 'secondary'> = {
      Confirmed: 'success', Pending: 'warn', Completed: 'info', Cancelled: 'danger'
    };
    return map[status];
  }

  openDetail(booking: ScheduleBooking) {
    this.selectedBooking = { ...booking };
    this.showDetailDialog = true;
  }

  updateStatus(id: string, status: BookingStatus) {
    this.apiService.updateBookingStatus(id, status.toUpperCase()).subscribe({
      next: () => {
        this.bookings.update(list => list.map(b => b.id === id ? { ...b, status } : b));
        if (this.selectedBooking?.id === id) this.selectedBooking = { ...this.selectedBooking, status };
      },
      error: (err) => console.error('Failed to update status', err)
    });
  }

  confirmBooking(id: string) { this.updateStatus(id, 'Confirmed'); }
  completeBooking(id: string) { this.updateStatus(id, 'Completed'); }
  cancelBooking(id: string)  { this.updateStatus(id, 'Cancelled'); this.showDetailDialog = false; }
}
