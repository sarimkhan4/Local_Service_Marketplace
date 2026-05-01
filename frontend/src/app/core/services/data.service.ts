import { Injectable, signal, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth';

export interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  category: string;
  rating: number;
  reviews: number;
  bio: string;
}

export interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  price: number;
}

export interface ServiceOffered {
  id: string;
  providerId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface CatalogService {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  basePrice: number;
  providers: CatalogProvider[];
}

export interface CatalogProvider {
  id: string;
  name: string;
  companyName: string;
  rating: number;
  reviews: number;
  yearsExperience: number;
  price: number;
  bio: string;
}

export interface CartItem {
  service: CatalogService;
  provider: CatalogProvider;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  cart         = signal<CartItem[]>([]);
  savedServices = signal<any[]>([]);
  myBookings   = signal<Booking[]>([]);
  myServices   = signal<ServiceOffered[]>([]);

  categories: Category[]         = [];
  catalogServices: CatalogService[] = [];

  constructor() {
    this.loadCategories();
    this.loadCatalogServices();
  }

  async loadCategories() {
    try {
      const data: any = await lastValueFrom(this.apiService.getCategories());
      this.categories = data.map((c: any) => ({
        id:          c.categoryId.toString(),
        name:        c.categoryName ?? c.name,
        icon:        'pi pi-folder',
        description: c.description ?? ''
      }));
    } catch (err) {
      console.error('[DataService] Failed to load categories', err);
    }
  }

  async loadCatalogServices() {
    try {
      const data: any = await lastValueFrom(this.apiService.getServices());
      this.catalogServices = data.map((s: any) => ({
        id:           s.serviceId.toString(),
        title:        s.name,
        description:  s.description,
        categoryId:   s.category?.categoryId?.toString() || '0',
        categoryName: s.category?.categoryName ?? s.category?.name ?? 'General',
        basePrice:    s.basePrice || 0,
        providers:    []   // populate via getProviders() if backend supports eager join
      }));
    } catch (err) {
      console.error('[DataService] Failed to load services', err);
    }
  }

  addToCart(item: CartItem)       { this.cart.update(c => [...c, item]); }
  removeFromCart(index: number)   {
    this.cart.update(c => {
      const copy = [...c];
      copy.splice(index, 1);
      return copy;
    });
  }
  clearCart() { this.cart.set([]); }

  // Load saved services for the current user
  async loadSavedServices() {
    const user = this.authService.currentUser();
    if (!user?.id) return;
    
    try {
      const data: any = await lastValueFrom(this.apiService.getCustomerSavedServices(user.id));
      this.savedServices.set(data || []);
    } catch (error) {
      console.error('Failed to load saved services:', error);
    }
  }

  // Save a service or provider
  async saveService(serviceId?: number, providerId?: number, notes?: string) {
    const user = this.authService.currentUser();
    if (!user?.id) return;
    
    try {
      const result: any = await lastValueFrom(this.apiService.saveService(user.id, serviceId, providerId, notes));
      await this.loadSavedServices(); // Reload saved services
      return result;
    } catch (error) {
      console.error('Failed to save service:', error);
      throw error;
    }
  }

  // Remove a saved service
  async removeSavedService(savedServiceId: string) {
    const user = this.authService.currentUser();
    if (!user?.id) return;
    
    try {
      await lastValueFrom(this.apiService.removeSavedService(user.id, savedServiceId));
      await this.loadSavedServices(); // Reload saved services
    } catch (error) {
      console.error('Failed to remove saved service:', error);
      throw error;
    }
  }

  // Check if a service or provider is saved
  async checkIfSaved(serviceId?: number, providerId?: number) {
    const user = this.authService.currentUser();
    if (!user?.id) return false;
    
    try {
      const result: any = await lastValueFrom(this.apiService.checkIfSaved(user.id, serviceId, providerId));
      return result.isSaved;
    } catch (error) {
      console.error('Failed to check if saved:', error);
      return false;
    }
  }

  // Legacy methods for backward compatibility
  savePro(pro: Provider) {
    if (!this.savedServices().find((s: any) => s.providerId === +pro.id)) {
      this.saveService(undefined, +pro.id, 'Saved from legacy method');
    }
  }
  unsavePro(proId: string) {
    const saved = this.savedServices().find((s: any) => s.providerId === +proId);
    if (saved) {
      this.removeSavedService(saved.savedServiceId.toString());
    }
  }
  addService(s: ServiceOffered)      { this.myServices.update(list => [...list, s]); }
  updateService(s: ServiceOffered)   { this.myServices.update(list => list.map(x => x.id === s.id ? s : x)); }
  getServicesByCategory(id: string)  { return this.catalogServices.filter(s => s.categoryId === id); }
  getServiceById(id: string)         { return this.catalogServices.find(s => s.id === id); }

  async createBooking(_serviceName: string, _providerName: string, _date: string, _price: number) {
    /* Real bookings use checkout: customer, provider, address, services, payment. */
  }
}
