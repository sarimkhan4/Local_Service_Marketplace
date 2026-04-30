import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { SelectItem } from 'primeng/api';
import type { SelectChangeEvent } from 'primeng/types/select';

import { DataService } from '../../../core/services/data.service';
import { environment } from '../../../../environments/environment';

export interface ListingService {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  basePrice: number;
  providers: any[];
}

@Component({
  selector: 'app-browse-services',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    ButtonModule, TagModule, DataViewModule,
    SelectButtonModule, SelectModule, InputTextModule, ChipModule
  ],
  templateUrl: './browse.html',
  styleUrl: './browse.css'
})
export class BrowseServices implements OnInit {
  private dataService = inject(DataService);
  private titleService = inject(Title);
  private http = inject(HttpClient);

  categories = this.dataService.categories;
  listings = signal<ListingService[]>([]);

  sortOptions: SelectItem[] = [
    { label: 'Price: Low to High', value: 'basePrice' },
    { label: 'Price: High to Low', value: '!basePrice' }
  ];
  sortKey: string = '';
  sortField: string = '';
  sortOrder: number = 1;

  layout: 'list' | 'grid' = 'grid';
  layoutOptions = ['list', 'grid'];

  selectedCategoryId = signal<string | null>(null);
  searchQuery = signal('');

  filteredServices = computed(() => {
    const catId = this.selectedCategoryId();
    const query = this.searchQuery().toLowerCase().trim();
    let results = [...this.listings()];
    
    if (catId) {
      const catName = this.categories.find(c => c.id === catId)?.name || '';
      results = results.filter(s => s.categoryName === catName);
    }

    if (query) {
      results = results.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.categoryName.toLowerCase().includes(query)
      );
    }
    return results;
  });

  constructor() {
    this.titleService.setTitle('Servicio | Browse Services');
  }

  ngOnInit() {
    this.fetchListings();
  }

  async fetchListings() {
    try {
      const data = await lastValueFrom(this.http.get<any[]>(`${environment.apiUrl}/services/listings`));
      
      const grouped = new Map<number, ListingService>();
      for (const ps of data) {
        if (!ps.service) continue;
        const sId = ps.service.serviceId;
        const price = Number(ps.price);
        
        if (!grouped.has(sId)) {
          grouped.set(sId, {
            id: sId,
            title: ps.service.name,
            description: ps.service.description || '',
            categoryName: ps.service.category ? ps.service.category.categoryName : 'Uncategorized',
            basePrice: price,
            providers: []
          });
        }
        
        const listing = grouped.get(sId)!;
        if (price < listing.basePrice) listing.basePrice = price;
        listing.providers.push({
          providerId: ps.provider?.userId,
          name: ps.provider?.name,
          price: price,
          rating: 4.8,
          reviews: 12
        });
      }

      this.listings.set(Array.from(grouped.values()));
    } catch (err) {
      console.error(err);
    }
  }

  selectCategory(catId: string | null) {
    this.selectedCategoryId.set(catId);
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onSortChange(event: SelectChangeEvent): void {
    const raw = event.value;
    const value = typeof raw === 'string' ? raw : '';
    if (value.startsWith('!')) {
      this.sortOrder = -1;
      this.sortField = value.slice(1);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }

  get activeCategory(): string | null {
    return this.selectedCategoryId();
  }

  get activeCategoryLabel(): string {
    const cat = this.categories.find(c => c.id === this.selectedCategoryId());
    return cat ? cat.name : 'All Services';
  }
}
