import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginRequest } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';
import { NavBar } from "../../shared/components/nav-bar/nav-bar";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NavBar]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private route: ActivatedRoute) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    
    // Show expired session message
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

        // AuthService already stores token and current user
        this.router.navigate(['/app/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 404) this.errorMessage = 'Email not found';
        else if (err.status === 401) this.errorMessage = 'Invalid password';
        else this.errorMessage = 'Login failed. Try again.';
      }
    });
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}