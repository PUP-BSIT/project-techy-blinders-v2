import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword {
  @Output() onCancel = new EventEmitter<void>();

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showSuccessPopup = signal(false);
  currentStep = signal(1);

  confirmPasswordFocused = signal(false);
  otpSent = signal(false);
  successPopupRedirect = signal(false);
  private successPopupTimer: any;

  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  forgotPasswordForm: FormGroup;

  constructor() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  next() {
    if (this.forgotPasswordForm.get('email')?.invalid ||
        this.forgotPasswordForm.get('newPassword')?.invalid ||
        this.forgotPasswordForm.get('confirmPassword')?.invalid) {
      return;
    }
    if (this.forgotPasswordForm.get('newPassword')?.value !== this.forgotPasswordForm.get('confirmPassword')?.value) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }
    this.errorMessage.set('');
    this.currentStep.set(2);
  }

  sendOtp() {
    this.errorMessage.set('');
    this.isLoading.set(true);
    const email = this.forgotPasswordForm.get('email')?.value;
    this.authService.requestOtp({ email }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set('OTP sent to your email.');
          this.otpSent.set(true);
          this.showSuccessPopup.set(true);
          this.successPopupRedirect.set(false);

          if (this.successPopupTimer) clearTimeout(this.successPopupTimer);
          this.successPopupTimer = 
          setTimeout(() => 
            this.closeSuccessPopup(),
            5000);
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to send OTP. Please try again.');
      }
    });
  }


  resetPassword() {
    if (this.forgotPasswordForm.invalid) return;
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);
    const formValue = this.forgotPasswordForm.value;
    this.authService.resetPasswordWithOtp({
      email: formValue.email,
      otp: formValue.otp,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set(response.message || 'Password reset successful!');
          this.showSuccessPopup.set(true);
          this.successPopupRedirect.set(true);

          if (this.successPopupTimer) clearTimeout(this.successPopupTimer);
          this.successPopupTimer = 
          setTimeout(() => 
            this.closeSuccessPopup(), 
            5000);
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('An error occurred. Please try again.');
      }
    });
  }

  closeSuccessPopup() {
    if (this.successPopupTimer) {
      clearTimeout(this.successPopupTimer);
      this.successPopupTimer = undefined;
    }

    this.showSuccessPopup.set(false);

    if (this.successPopupRedirect()) {
      this.forgotPasswordForm.reset();
      this.currentStep.set(1);
      this.otpSent.set(false);
      this.router.navigate(['/login']);
    } else {
      this.successMessage.set('');
    }
  }

  private router = inject(Router);

  cancel() {
    this.forgotPasswordForm.reset();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.currentStep.set(1);
    this.otpSent.set(false);
    this.router.navigate(['/login']);
    this.onCancel.emit();
  }

  get emailControl() {
    return this.forgotPasswordForm.get('email');
  }

  get otpControl() {
    return this.forgotPasswordForm.get('otp');
  }

  get newPasswordControl() {
    return this.forgotPasswordForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.forgotPasswordForm.get('confirmPassword');
  }
}