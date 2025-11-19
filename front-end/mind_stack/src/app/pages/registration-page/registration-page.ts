import { Component, inject } from '@angular/core';
import { NavBar } from "../../shared/components/nav-bar/nav-bar";
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RegisterRequest, RegisterResponse } from '../../models/user.model'; // Update path
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../service/user-service';

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
      this.registrationFrom.markAllAsTouched();
      return;
    }

    if (this.passwordControl?.value !== this.confirmPasswordControl?.value) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    const registerRequest: RegisterRequest = {
      username: this.registrationFrom.value.username,
      email: this.registrationFrom.value.email,
      password: this.registrationFrom.value.password
    };

    this.userService.createUser(registerRequest).subscribe({
      next: (response: RegisterResponse) => {
        this.isLoading = false;
        
        if (response.account_succesfully_created) {
          this.successMessage = `Registration successful! Your User ID: ${response.user_id}`;
          console.log('User created with ID:', response.user_id);
          
          this.registrationFrom.reset();
          
          setTimeout(() => {
          }, 2000);
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        
        if (error.error && error.error.error_message) {
          this.errorMessage = error.error.error_message;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        
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