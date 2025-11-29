import { Component, inject } from '@angular/core';
import { NavBar } from "../../shared/components/nav-bar/nav-bar";
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RegisterRequest, RegisterResponse } from '../../models/user.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../service/user-service';
import { HttpErrorResponse } from '@angular/common/http';

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
  successMessage = '';
  isSuccessModalOpen = false;
  registeredUserId: number | null = null;

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

  isFormValid(): boolean {
    return this.registrationFrom.valid && 
           this.passwordControl?.value === this.confirmPasswordControl?.value;
  }

  registrationValidation() {
    this.successMessage = '';
    this.isSuccessModalOpen = false;
    this.registeredUserId = null;

    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;

    const userData: RegisterRequest = {
      email: this.emailControl?.value,
      username: this.usernameControl?.value,
      password: this.passwordControl?.value
    }

    this.userService.registerUser(userData).subscribe({
      next: (response: RegisterResponse) => {
        this.isLoading = false;
      
        this.registeredUserId = response.user_id;
        this.successMessage = "Registration is Successful";
        this.isSuccessModalOpen = true;
        
        console.log('User registered successfully');
        console.log('Generated User ID:', this.registeredUserId);
        
        this.registrationFrom.reset();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        console.error('Error details:', error.error);
      }
    });
  }

  isCopied = false;

  copyUserIdToClipboard() {
    if (this.registeredUserId !== null) {
      navigator.clipboard.writeText(this.registeredUserId.toString()).then(() => {
        console.log('User ID copied to clipboard:', this.registeredUserId);
        this.isCopied = true;
        
        setTimeout(() => {
          this.isCopied = false;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy user ID:', err);
        alert('Failed to copy User ID. Please copy it manually.');
      });
    }
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