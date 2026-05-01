import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth';
import { BookingService } from '../../../core/services/booking.service';
import { RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    CardModule, 
    ButtonModule, 
    IconField, 
    InputIcon, 
    InputTextModule, 
    PasswordModule, 
    SelectButtonModule,
    InputNumberModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  host: { 'class': 'auth-page' }
})
export class Signup {
  selectedRole: string = 'customer';
  roleOptions: any[] = [
    { label: 'Customer', value: 'customer' },
    { label: 'Service Provider', value: 'provider' }
  ];

  // Common User fields mapped to ER diagram
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  phoneNumber = '';

  // Customer-specific fields mapped to ER diagram
  street = '';
  city = '';
  state = '';
  zipCode = '';

  // Provider-specific fields mapped to ER diagram
  companyName = '';
  bio = '';
  experienceYears: number | null = null;

  constructor(private authService: AuthService, private router: Router, private dataService: DataService, private bookingService: BookingService) {}

  async onSubmit() {
    console.log(`Signup attempt for ${this.selectedRole}:`, this.email);
    const signupData = {
      role: this.selectedRole === 'customer' ? 'Customer' : 'Provider',
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phoneNumber: this.phoneNumber,
      street: this.street,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      companyName: this.companyName,
      bio: this.bio,
      experienceYears: this.experienceYears
    };
    
    const user = await this.authService.signup(signupData) as any;
    
    // Save address for customer after successful signup
    if (this.selectedRole === 'customer' && user?.id && (this.street && this.city)) {
      try {
        await this.bookingService.addAddress(user.id, {
          street: this.street,
          city: this.city,
          state: this.state,
          zipCode: this.zipCode,
          isDefault: true,
          label: 'Home'
        });
        console.log('Address saved successfully for customer');
      } catch (error) {
        console.error('Failed to save address:', error);
      }
    }
    
    // Check pending actions only if customer
    if (this.selectedRole === 'customer') {
       const pending = localStorage.getItem('pendingAction');
       if (pending) {
          const action = JSON.parse(pending);
          if (action.type === 'save') {
              this.dataService.savePro({
                  id: action.service.id,
                  firstName: action.service.name,
                  lastName: '',
                  companyName: 'LSM Local Provider',
                  category: action.categoryName,
                  rating: 4.5,
                  reviews: 10,
                  bio: 'Saved from Home page.'
              });
              localStorage.removeItem('pendingAction');
              this.router.navigate(['/app/customer/saved']);
              return;
          } else if (action.type === 'book') {
              this.dataService.createBooking(action.service.name, 'LSM Local Provider', new Date().toISOString(), action.service.startingPrice);
              localStorage.removeItem('pendingAction');
              this.router.navigate(['/app/customer/bookings']);
              return;
          }
       }
       this.router.navigate(['/app/customer/dashboard']);
    } else {
       this.router.navigate(['/app/provider/dashboard']);
    }
  }
}
