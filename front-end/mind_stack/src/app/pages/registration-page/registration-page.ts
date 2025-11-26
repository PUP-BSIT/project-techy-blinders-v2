import { Component, inject } from '@angular/core';
import { NavBar } from "../../shared/components/nav-bar/nav-bar";
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RegisterRequest, RegisterResponse } from '../../models/user.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../service/user-service';
import { HttpErrorResponse } from '@angular/common/http'; // Add this import

@Component({
  selector: 'app-registration-page',
  imports: [NavBar, ReactiveFormsModule, CommonModule],
  templateUrl: './registration-page.html',
  styleUrl: './registration-page.scss'
})

export class RegistrationPage {

  formBuilder = inject(FormBuilder);
  userService = inject(UserService)
  router = inject(Router);
  
  registrationFrom: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.registrationFrom = this.formBuilder.group ({
      email: ['', {
        validators: [Validators.required, Validators.email, Validators.maxLength(20)],
        updateOn: 'change'
      }],

      username: ['', {
        validators: [Validators.required, Validators.maxLength(20)],
        updateOn: 'change'
      }],

      password: ['', {
        validators: [Validators.required, Validators.minLength(6)],
        updateOn: 'change'
      }],

      confirmPassword: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }],
    }); 
  }

  registrationValidation() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registrationFrom.invalid) {
      this.errorMessage = 'Fill out the form';
      return;
    }

    this.isLoading = true;

    const userData: RegisterRequest = {
      email: this.emailControl?.value,
      username: this.usernameControl?.value,
      password: this.passwordControl?.value
    }

    this.userService.registerUser(userData).subscribe({
      next: (value) => {
        this.isLoading = false;
        this.successMessage = "Registration is Successful";
        this.registrationFrom.reset();
        console.log ('User registered', value);

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  get emailControl () {
    return this.registrationFrom.get('email');
  }

  get usernameControl () {
    return this.registrationFrom.get('username');
  }

  get passwordControl () {
    return this.registrationFrom.get('password');
  }

  get confirmPasswordControl () {
    return this.registrationFrom.get ('confirmPassword');
  }
}