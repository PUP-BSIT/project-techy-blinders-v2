import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoginRequest } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';
import { NavBar } from "../../shared/components/nav-bar/nav-bar";
import { ForgotPassword } from '../forgot-password/forgot-password';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NavBar, RouterLink, ForgotPassword]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  showForgotPasswordModal = false;
  showPassword = false;

  loginForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  successModalOpen = signal(false);
  errorModalOpen = signal(false);

  constructor(private route: ActivatedRoute) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['expired']) {
        this.errorMessage = 'Your session has expired. Please log in again.';
      }
    });
  }

  login() {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) return;

    this.isLoading = true;

    const userData: LoginRequest = {
      email: this.emailControl?.value,
      password: this.passwordControl?.value
    };

    this.authService.login(userData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Login successful!';
        this.loginForm.reset();

        this.successModalOpen.set(true);

        setTimeout(() => {
          this.successModalOpen.set(false);
          this.router.navigate(['/app/dashboard']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 404) this.errorMessage = 'Email not found';
        else if (err.status === 401) this.errorMessage = 'Invalid password';
        else this.errorMessage = 'Login failed. Try again.';
      }
    });
  }

  closeSuccessModal() {
    this.successModalOpen.set(false);
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  forgotPasswordModal() {
    this.showForgotPasswordModal = true;
  }

  closeModal() {
    this.showForgotPasswordModal = false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}