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
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  successModalOpen = signal(false);
  errorModalOpen = signal(false);

  constructor(private route: ActivatedRoute) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
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
        switch(err.status) {
          case 404:
            this.errorMessage = "Account not found";
            break;
          case 401:
            this.errorMessage = "Invalid email or password";
            break;
          case 403:
            this.errorMessage = "You don't have a permission on this action";
            break;
          case 500:
            this.errorMessage  = "Something went wrong on our end. Please try again";
            break;
          default:
            this.errorMessage = "Login failed. Please try again";
        }
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
}