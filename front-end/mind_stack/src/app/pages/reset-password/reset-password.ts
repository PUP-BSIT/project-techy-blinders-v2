import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword {
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showSuccessPopup = signal(false);
  showNewPassword = false;
  showConfirmPassword = false;

  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  resetPasswordForm: FormGroup;
  token: string = '';

  constructor() {
    this.resetPasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  resetPassword() {
    if (this.resetPasswordForm.invalid) return;
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);
    const formValue = this.resetPasswordForm.value;
    this.authService.resetPasswordWithToken({
      token: this.token,
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
        this.errorMessage.set('Something went wrong. Please try again.');
      }
    });
  }

  closeSuccessPopup() {
    this.showSuccessPopup.set(false);
    this.resetPasswordForm.reset();
    this.router.navigate(['/login']);
  }

  get newPasswordControl() {
    return this.resetPasswordForm.get('newPassword');
  }
  get confirmPasswordControl() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
