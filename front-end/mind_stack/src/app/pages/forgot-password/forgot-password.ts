import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';

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

  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  forgotPasswordForm: FormGroup;

  constructor() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  forgotPassword() {
    if (this.forgotPasswordForm.invalid) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    const formValue = this.forgotPasswordForm.value;

    this.authService.resetPassword({
      email: formValue.email,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        if (response.success) {
          this.successMessage.set(response.message);
          this.showSuccessPopup.set(true);
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
    this.showSuccessPopup.set(false);
    this.forgotPasswordForm.reset();
    this.onCancel.emit();
  }

  cancel() {
    this.forgotPasswordForm.reset();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.onCancel.emit();
  }

  get emailControl() {
    return this.forgotPasswordForm.get('email');
  }

  get newPasswordControl() {
    return this.forgotPasswordForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.forgotPasswordForm.get('confirmPassword');
  }
}