import { Component, inject } from '@angular/core';
import { NavBar } from "../../shared/components/nav-bar/nav-bar";
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../service/user-service';
import { LoginRequest } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  imports: [NavBar, RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})

export class LoginPage {
  formBuilder = inject(FormBuilder);
  loginForm: FormGroup;
  userService = inject(UserService);
  router = inject(Router);

  isLoading = false;
  successMessage = '';

  constructor () {
    this.loginForm = this.formBuilder.group ({
      userId: ['', {
        validators: [Validators.required, Validators.maxLength(10), Validators.pattern(/^[0-9]+$/)],
        updateOn: 'change'
      }],

      password: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }],
    });
  }

  loginValidation () {
    this.successMessage = '';

    if (this.loginForm.invalid) {
        return;
    }

    this.isLoading = true;

    const userData: LoginRequest = {
      user_id: this.userIdControl?.value,
      password: this.passwordControl?.value
    }

    this.userService.loginUser(userData).subscribe ({
      next: (value) => {
        this.isLoading = false;
        this.successMessage = "Login successful";
        this.loginForm.reset();

        setTimeout(() => {
          this.router.navigate(['app/dashboard'])
        }, 2000)
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Login error:', error);
      }
    })
  }

  get userIdControl () {
    return this.loginForm.get ('userId');
  }

  get passwordControl () {
    return this.loginForm.get ('password');
  }
}