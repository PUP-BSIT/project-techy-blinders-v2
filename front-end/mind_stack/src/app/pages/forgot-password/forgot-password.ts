import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  @Output() onCancel = new EventEmitter<void>();

  showForgotPasswordModal = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  forgotPasswordForm: FormGroup;

  constructor() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', {
        validators: [Validators.required, Validators.email],
        updateOn: 'change'
      }],

      newPassword: ['', {
        validators: [Validators.required, Validators.minLength(6)],
        updateOn: 'change'
      }],

      confirmPassword: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }]
    });
  }

  forgotPassword() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    const formValue = this.forgotPasswordForm.value;
    
    this.authService.resetPassword({
      email: formValue.email,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = response.message;
          setTimeout(() => {
            this.forgotPasswordForm.reset();
            this.onCancel.emit();
          }, 2000);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 403) {
          this.errorMessage = 'Access forbidden. Please contact support if this issue persists.';
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else {
          this.errorMessage = 'An error occurred while resetting password. Please try again.';
        }
        console.error('Reset password error:', error);
      }
    });
  }

  cancel() {
    this.forgotPasswordForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.onCancel.emit();
  }

  get emailControl() {
    return this.forgotPasswordForm.get('email');
  }

  get confirmPasswordControl() {
    return this.forgotPasswordForm.get('confirmPassword');
  }

  get newPasswordControl() {
    return this.forgotPasswordForm.get('newPassword');
  }
}