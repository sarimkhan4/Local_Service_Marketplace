import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ChartModule } from 'primeng/chart'; 
import { SkeletonModule } from 'primeng/skeleton';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-customer-dashboard',
  imports: [CommonModule, TableModule, ButtonModule, ChartModule, ProgressBarModule, MenuModule, SkeletonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class CustomerDashboard implements OnInit, OnDestroy {
  loading = signal(true);
  chartData: any;
  chartOptions: any;
  livelyChartData: any;
  livelyChartOptions: any;
  chartInterval: any;
  menuItems: MenuItem[] = [
    { label: 'View Details', icon: 'pi pi-search' },
    { label: 'Cancel', icon: 'pi pi-times', styleClass: 'text-red-500' },
    { label: 'Contact Provider', icon: 'pi pi-envelope' }
  ];

  stats: any[] = [];
  appointments: any[] = [];
  mostBookedCategories: any[] = [];
  notifications: any[] = [];

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  async ngOnInit() {
    this.initChart();
    await this.loadDashboardData();
    this.loading.set(false);
  }

  async loadDashboardData() {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    try {
      const [bookingsRaw, notifsRaw]: any = await Promise.all([
        lastValueFrom(this.apiService.getCustomerBookings(userId)),
        lastValueFrom(this.apiService.getUserNotifications(userId))
      ]);
      
      const bookings = bookingsRaw || [];
      const notifs = notifsRaw || [];

      // APPOINTMENTS (Latest 3)
      this.appointments = bookings
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map((b: any) => ({
          id: b.bookingId,
          provider: b.provider?.name || 'Unknown Provider',
          service: b.services?.length ? b.services[0].name : 'Service',
          status: b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase(),
          amount: '$' + Number(b.totalAmount).toFixed(2),
          image: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(b.provider?.name || 'Unknown Provider') + '&background=random'
        }));

      // STATS
      const activeBookings = bookings.filter((b: any) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status));
      const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED');
      const totalSpent = completedBookings.reduce((sum: number, b: any) => sum + Number(b.totalAmount), 0);
      const uniquePros = new Set(completedBookings.map((b: any) => b.provider?.userId)).size;

      this.stats = [
        { label: 'Active Bookings', value: activeBookings.length.toString(), icon: 'pi pi-calendar-plus', color: 'blue', detailValue: 'Ongoing', detailText: 'currently scheduled' },
        { label: 'Completed Services', value: completedBookings.length.toString(), icon: 'pi pi-check-circle', color: 'green', detailValue: 'Past', detailText: 'completed jobs' },
        { label: 'Total Spent', value: '$' + totalSpent.toFixed(0), icon: 'pi pi-wallet', color: 'orange', detailValue: 'Paid', detailText: 'revenue collected' },
        { label: 'Provider Interactions', value: uniquePros.toString(), icon: 'pi pi-users', color: 'cyan', detailValue: 'Pros', detailText: 'worked with' }
      ];

      // MOST BOOKED CATEGORIES (Approximation out of completed)
      const categoriesMap: { [key: string]: number } = {};
      completedBookings.forEach((b: any) => {
         const cat = b.services?.length && b.services[0].category ? b.services[0].category.categoryName : 'General Services';
         categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
      });

      const totalCats = Math.max(1, completedBookings.length);
      const sortedCats = Object.entries(categoriesMap).sort((a,b) => b[1]-a[1]).slice(0, 4);
      const colors = ['orange', 'cyan', 'pink', 'green'];
      this.mostBookedCategories = sortedCats.map((c, i) => ({
        name: c[0],
        bookings: c[1].toString(),
        revenue: '%' + Math.round((c[1]/totalCats)*100),
        progress: Math.round((c[1]/totalCats)*100),
        color: colors[i % colors.length]
      }));

      // NOTIFICATIONS 
      if (notifs.length > 0) {
        this.notifications = notifs.slice(0, 3).map((n: any) => {
           let icon = 'pi-bell';
           let color = 'blue';
           if (n.type === 'booking_created' || n.type === 'booking_update') { icon = 'pi-check'; color = 'green'; }
           if (n.type === 'payment_success') { icon = 'pi-credit-card'; color = 'cyan'; }
           
           return { text: n.title, amount: n.message, icon, color };
        });
      } else {
        this.notifications = [];
      }

    } catch (e) {
      console.error('Failed to load dashboard data', e);
    }
  }

  initChart() {
    this.chartData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                type: 'doughnut',
                label: 'Subscriptions',
                backgroundColor: '#008FFB', 
                data: [9000, 15000, 20000, 9000],
                barThickness: 40,
                borderRadius: 2
            },
            {
                type: 'doughnut',
                label: 'Advertising',
                backgroundColor: '#00E396', 
                data: [2100, 8400, 2400, 7500],
                barThickness: 40
            },
            {
                type: 'doughnut',
                label: 'Affiliate',
                backgroundColor: '#FEB019',
                data: [4100, 2600, 3400, 7400],
                borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
                borderSkipped: false,
                barThickness: 40
            }
        ]
    };

    this.chartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            tooltip: { mode: 'index', intersect: false },
            legend: { position: 'bottom', labels: { color: '#475569', usePointStyle: true, padding: 20 } }
        },
        scales: {
            x: { stacked: true, ticks: { color: '#64748b' }, grid: { color: 'transparent', borderColor: 'transparent' } },
            y: { stacked: true, ticks: { color: '#64748b' }, grid: { color: '#e2e8f0', borderColor: 'transparent', drawTicks: false } }
        }
    };

    this.livelyChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                type: 'bar',
                label: 'Engagement',
                backgroundColor: '#8b5cf6',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderRadius: 4
            },
            {
                type: 'bar',
                label: 'Bookings',
                backgroundColor: '#ec4899',
                data: [28, 48, 40, 19, 86, 27, 90],
                borderRadius: 4
            }
        ]
    };

    this.livelyChartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        animation: {
            duration: 400,
            easing: 'easeOutQuart'
        },
        plugins: {
            tooltip: { mode: 'index', intersect: false },
            legend: { position: 'bottom', labels: { color: '#475569', usePointStyle: true, padding: 20 } }
        },
        scales: {
            x: { stacked: false, ticks: { color: '#64748b' }, grid: { color: 'transparent', borderColor: 'transparent' } },
            y: { stacked: false, ticks: { color: '#64748b' }, grid: { color: '#e2e8f0', borderColor: 'transparent', drawTicks: false } }
        }
    };
    
    // Animate the chart periodically
    this.chartInterval = setInterval(() => {
        if (this.livelyChartData) {
            this.livelyChartData = {
                ...this.livelyChartData,
                datasets: this.livelyChartData.datasets.map((dataset: any) => ({
                    ...dataset,
                    data: dataset.data.map(() => Math.floor(Math.random() * 100) + 10)
                }))
            };
        }
    }, 2000);
  }

  ngOnDestroy() {
    if (this.chartInterval) {
      clearInterval(this.chartInterval);
    }
  }
}
