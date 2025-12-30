import { Component, inject, signal } from '@angular/core';
import { NavBar } from '../../shared/components/nav-bar/nav-bar';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RegisterRequest, RegisterResponse } from '../../models/user.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.html',
  styleUrls: ['./registration-page.scss'],
  standalone: true,
  imports: [NavBar, ReactiveFormsModule, CommonModule]
})
export class RegistrationPage {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registrationForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  // Signals
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  registeredUserId = signal<number | null>(null);

  submitPopupVisible = signal(false);

  showSubmitPopup() {
    return this.submitPopupVisible();
  }

  openSubmitPopup() {
    this.submitPopupVisible.set(true);
  }

  closeSubmitPopup() {
    this.submitPopupVisible.set(false);

    if (this.successMessage()) {
      this.router.navigate(['/login']);
    }
  }

  constructor() {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  get emailControl() { return this.registrationForm.get('email'); }
  get usernameControl() { return this.registrationForm.get('username'); }
  get passwordControl() { return this.registrationForm.get('password'); }
  get confirmPasswordControl() { return this.registrationForm.get('confirmPassword'); }

  isFormValid(): boolean {
    return this.registrationForm.valid &&
           this.passwordControl?.value === this.confirmPasswordControl?.value;
  }

  register() {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.registeredUserId.set(null);

    if (!this.isFormValid()) {
      this.errorMessage.set('Please fix form errors and make sure passwords match');
      return;
    }

    this.isLoading.set(true);

    const userData: RegisterRequest = {
      email: this.emailControl?.value,
      username: this.usernameControl?.value,
      password: this.passwordControl?.value
    };

    this.authService.register(userData).subscribe({
      next: (response: RegisterResponse) => {
        this.isLoading.set(false);
        if (response.account_successfully_created) {
          this.registeredUserId.set(response.user_id);
          this.successMessage.set('Registration successful!');
          this.openSubmitPopup();
        } else {
          this.errorMessage.set('Registration failed. Try again.');
          this.openSubmitPopup();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        // Check for email or username already in use
        if (err.status === 409 && err.error?.error === 'Email already in use') {
          this.errorMessage.set('This email is already registered. Please use a different email.');
        } else if (err.status === 409 && err.error?.error === 'Username already in use') {
          this.errorMessage.set('This username is already taken. Please choose another username.');
        } else {
          this.errorMessage.set(err.error?.error || err.error?.message || 'Registration failed. Try again.');
        }
        this.openSubmitPopup();
      }
    });
  }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}