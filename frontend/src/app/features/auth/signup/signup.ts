import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterModule,
    CardModule, 
    ButtonModule, 
    IconField, 
    InputIcon, 
    InputTextModule, 
    PasswordModule, 
    SelectButtonModule,
    InputNumberModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  host: { 'class': 'auth-page' }
})
export class Signup implements OnInit {
  selectedRole: string = 'customer';
  roleOptions: any[] = [
    { label: 'Customer', value: 'customer' },
    { label: 'Service Provider', value: 'provider' }
  ];

  signupForm!: FormGroup;
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private dataService: DataService, 
    private bookingService: BookingService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[0-9]{10,15}$/)]],
      
      // Customer-specific fields
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],

      // Provider-specific fields
      companyName: ['', Validators.required],
      bio: ['', [Validators.required, Validators.minLength(20)]],
      experienceYears: [null, [Validators.required, Validators.min(0)]]
    });

    this.updateValidators();
  }

  onRoleChange() {
    this.updateValidators();
  }

  private updateValidators() {
    const customerFields = ['street', 'city', 'state', 'zipCode'];
    const providerFields = ['companyName', 'bio', 'experienceYears'];

    if (this.selectedRole === 'customer') {
      customerFields.forEach(field => {
        this.signupForm.get(field)?.setValidators([Validators.required]);
        if (field === 'zipCode') {
           this.signupForm.get(field)?.setValidators([Validators.required, Validators.pattern(/^[0-9]{5}$/)]);
        }
      });
      providerFields.forEach(field => this.signupForm.get(field)?.clearValidators());
    } else {
      customerFields.forEach(field => this.signupForm.get(field)?.clearValidators());
      providerFields.forEach(field => {
        this.signupForm.get(field)?.setValidators([Validators.required]);
        if (field === 'bio') {
          this.signupForm.get(field)?.setValidators([Validators.required, Validators.minLength(20)]);
        }
        if (field === 'experienceYears') {
          this.signupForm.get(field)?.setValidators([Validators.required, Validators.min(0)]);
        }
      });
    }

    customerFields.forEach(field => this.signupForm.get(field)?.updateValueAndValidity());
    providerFields.forEach(field => this.signupForm.get(field)?.updateValueAndValidity());
  }

  async onSubmit() {
    this.signupForm.markAllAsTouched();

    if (this.signupForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Form Invalid',
        detail: 'Please fill in all required fields correctly.',
        life: 3000
      });
      return;
    }

    this.isLoading = true;
    const formValues = this.signupForm.value;
    
    console.log(`Signup attempt for ${this.selectedRole}:`, formValues.email);
    
    const signupData = {
      role: this.selectedRole === 'customer' ? 'Customer' : 'Provider',
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      password: formValues.password,
      phoneNumber: formValues.phoneNumber,
      street: formValues.street,
      city: formValues.city,
      state: formValues.state,
      zipCode: formValues.zipCode,
      companyName: formValues.companyName,
      bio: formValues.bio,
      experienceYears: formValues.experienceYears
    };
    
    try {
      const user = await this.authService.signup(signupData) as any;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Registration Successful',
        detail: 'Account created successfully! Redirecting...',
        life: 3000
      });
      
      // Save address for customer after successful signup
      if (this.selectedRole === 'customer' && user?.id && (formValues.street && formValues.city)) {
        try {
          await this.bookingService.addAddress(user.id, {
            street: formValues.street,
            city: formValues.city,
            state: formValues.state,
            zipCode: formValues.zipCode,
            isDefault: true,
            label: 'Home'
          });
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
    } catch (error: any) {
      console.error('Signup failed:', error);
      let errorMessage = 'An error occurred during registration. Please try again.';
      
      const backendMessage = error.error?.message;
      
      if (error.status === 409 || (error.status === 400 && backendMessage === 'Email already in use')) {
        errorMessage = 'Email already in use';
      } else if (backendMessage) {
        errorMessage = backendMessage;
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Registration Failed',
        detail: errorMessage,
        life: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }
}

