import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { DataService } from '../../../core/services/data.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { RouterModule } from '@angular/router';
import { validateEmail, validateRequired, FormValidator } from '../../../core/utils/validation.utils';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrl: './login.css',
  host: { 'class': 'auth-page' }
})
export class Login {
  email = '';
  password = '';
  rememberMe: boolean = false;
  isLoading = false;
  validationErrors: { email?: string; password?: string } = {};

  private authService = inject(AuthService);
  private router = inject(Router);
  private dataService = inject(DataService);
  private errorHandler = inject(ErrorHandlerService);
  private validator = new FormValidator();

  private validateForm(): boolean {
    this.validationErrors = {};
    this.validator.clearErrors();

    const emailResult = validateEmail(this.email);
    if (!emailResult.valid) {
      this.validationErrors.email = emailResult.errors[0];
    }

    const passwordResult = validateRequired(this.password, 'Password');
    if (!passwordResult.valid) {
      this.validationErrors.password = passwordResult.errors[0];
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  async onSubmit() {
    if (!this.validateForm()) {
      this.errorHandler.showWarning('Please fix the validation errors before proceeding.');
      return;
    }

    this.isLoading = true;
    console.log('Login attempt:', this.email);

    try {
      await this.authService.login(this.email, this.password);

      this.errorHandler.showSuccess('Welcome back! You have successfully logged in.');

      // Check for pending actions
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

      const userRole = this.authService.currentUser()?.role;
      if (userRole === 'Provider') {
        this.router.navigate(['/app/provider/dashboard']);
      } else {
        this.router.navigate(['/app/customer/dashboard']);
      }
    } catch (error: any) {
      this.errorHandler.handleHttpError(error, 'Login failed. Please check your credentials and try again.');
    } finally {
      this.isLoading = false;
    }
  }
}
