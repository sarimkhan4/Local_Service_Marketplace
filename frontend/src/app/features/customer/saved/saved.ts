import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-saved-pros',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, AvatarModule, TagModule, MessageModule],
  templateUrl: './saved.html',
  styleUrl: './saved.css',
  providers: [MessageService],
})
export class SavedPros implements OnInit {
  private dataService = inject(DataService);
  private titleService = inject(Title);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  // Access explicitly tracking computed Signal array for DOM reflow
  savedServices = computed(() => this.dataService.savedServices());
  loading = signal(false);

  constructor() {
    this.titleService.setTitle('Servicio | Saved Services');
  }

  async ngOnInit() {
    await this.loadSavedServices();
  }

  async loadSavedServices() {
    this.loading.set(true);
    try {
      await this.dataService.loadSavedServices();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load saved services',
        life: 3000
      });
    } finally {
      this.loading.set(false);
    }
  }

  async unsave(savedServiceId: string) {
    try {
      await this.dataService.removeSavedService(savedServiceId);
      this.messageService.add({
        severity: 'success',
        summary: 'Removed',
        detail: 'Service removed from saved list',
        life: 3000
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to remove saved service',
        life: 3000
      });
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getRatingStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
}
