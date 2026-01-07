import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoginRequest } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';
import { NavBar } from "../../shared/components/nav-bar/nav-bar";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NavBar, RouterLink]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  showPassword = false;

  loginForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  successModalOpen = signal(false);
  errorModalOpen = signal(false);

  constructor(private route: ActivatedRoute) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(254)
        ]
      ],
      password: ['', [Validators.required]]
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['expired']) {
        this.errorMessage.set('Your session has expired. Please log in again.');
        this.errorModalOpen.set(true);
      }
    });
  }

  login() {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.errorModalOpen.set(false);

    if (this.loginForm.invalid) {
      this.errorMessage.set(this.getValidationErrorMessage());
      this.errorModalOpen.set(true);
      return;
    }

    this.isLoading.set(true);

    const userData: LoginRequest = {
      email: this.emailControl?.value,
      password: this.passwordControl?.value
    };

    this.authService.login(userData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Login successful!');
        this.loginForm.reset();

        this.successModalOpen.set(true);

        setTimeout(() => {
          this.successModalOpen.set(false);
          this.router.navigate(['/app/dashboard']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        switch (err.status) {
          case 404:
            this.errorMessage.set(
              "Account not found"
            );
            break;
          case 401:
            this.errorMessage.set(
              this.getCredentialErrorMessage(err)
            );
            break;
          case 403:
            this.errorMessage.set(
              "You don't have a permission on this action"
            );
            break;
          case 500:
            this.errorMessage.set(
              "Something went wrong on our end. Please try again"
            );
            break;
          default:
            this.errorMessage.set(
              "Login failed. Please try again"
            );
        }
        this.errorModalOpen.set(true);
      }
    });
  }

  private getValidationErrorMessage(): string {
    if (this.emailControl?.invalid) {
      if (this.emailControl.errors?.['required']) {
        return 'Email is required';
      }
      if (this.emailControl.errors?.['email']) {
        return 'Invalid email';
      }
      if (this.emailControl.errors?.['maxlength']) {
        return 'Email exceeds length limit';
      }
    }
    if (this.passwordControl?.invalid) {
      if (this.passwordControl.errors?.['required']) {
        return 'Password is required';
      }
    }
    return 'Please correct the highlighted fields';
  }

  private getCredentialErrorMessage(err: HttpErrorResponse): string {
    if (this.emailControl?.invalid) {
      return 'Invalid email';
    }
    if (this.passwordControl?.invalid) {
      return 'Invalid password';
    }

    const serverMessage = (
      err.error?.error || err.error?.message || ''
    ).toLowerCase();
    if (serverMessage.includes('email')) {
      return 'Invalid email';
    }
    if (serverMessage.includes('password')) {
      return 'Invalid password';
    }

    return 'Invalid password';
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  closeSuccessModal() {
    this.successModalOpen.set(false);
  }

  closeErrorModal() {
    this.errorModalOpen.set(false);
  }
}