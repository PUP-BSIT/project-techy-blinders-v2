import { Component, inject, signal } from '@angular/core';
import { NavBar } from "../../shared/components/nav-bar/nav-bar";
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';

interface Login {
  userId: number;
  password: string;
}

@Component({
  selector: 'app-login-page',
  imports: [NavBar, RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})

export class LoginPage {
  formBuilder = inject(FormBuilder);
  loginForm: FormGroup;

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
    console.log(this.loginForm.value);
    this.loginForm.reset();
  }

  get userIdControl () {
    return this.loginForm.get ('userId');
  }

  get passwordControl () {
    return this.loginForm.get ('password');
  }
}
