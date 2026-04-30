import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorDetails {
  message: string;
  details?: string[];
  statusCode?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private messageService = inject(MessageService);

  /**
   * Handle HTTP errors and display user-friendly messages
   */
  handleHttpError(error: HttpErrorResponse, fallbackMessage: string = 'Something went wrong. Please try again.'): void {
    let errorDetails: ErrorDetails;

    if (error.error && typeof error.error === 'object') {
      // Backend returned a structured error
      errorDetails = {
        message: error.error.message || fallbackMessage,
        details: error.error.details,
        statusCode: error.status,
        error: error.error.error
      };
    } else if (error.status === 0) {
      // Network error
      errorDetails = {
        message: 'Unable to connect to the server. Please check your internet connection.',
        statusCode: 0
      };
    } else {
      // Generic HTTP error
      errorDetails = {
        message: this.getUserFriendlyMessage(error.status, fallbackMessage),
        statusCode: error.status
      };
    }

    this.showError(errorDetails);
  }

  /**
   * Show success message
   */
  showSuccess(detail: string, summary: string = 'Success'): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000
    });
  }

  /**
   * Show error message
   */
  showError(error: ErrorDetails | string): void {
    const details = typeof error === 'string'
      ? { message: error }
      : error;

    // Show main error message
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: details.message,
      life: 5000
    });

    // Show additional validation details if present
    if (details.details && details.details.length > 0) {
      details.details.forEach((detail, index) => {
        setTimeout(() => {
          this.messageService.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail,
            life: 4000
          });
        }, index * 200);
      });
    }
  }

  /**
   * Show warning message
   */
  showWarning(detail: string, summary: string = 'Warning'): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 4000
    });
  }

  /**
   * Show info message
   */
  showInfo(detail: string, summary: string = 'Info'): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 3000
    });
  }

  /**
   * Get user-friendly message based on HTTP status code
   */
  private getUserFriendlyMessage(status: number, fallback: string): string {
    const messages: Record<number, string> = {
      400: 'The request was invalid. Please check your input and try again.',
      401: 'Your session has expired. Please log in again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'This operation could not be completed due to a conflict.',
      422: 'We could not process your request. Please check your data.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Something went wrong on our end. Please try again later.',
      503: 'The service is temporarily unavailable. Please try again later.',
    };

    return messages[status] || fallback;
  }
}
