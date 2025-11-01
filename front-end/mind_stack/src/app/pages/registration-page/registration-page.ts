import { Component, inject } from '@angular/core';
import { NavBar } from "../../shared/components/nav-bar/nav-bar";
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';

interface Registration {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-registration-page',
  imports: [NavBar, ReactiveFormsModule],
  templateUrl: './registration-page.html',
  styleUrl: './registration-page.scss'
})

export class RegistrationPage {

  formBuilder = inject(FormBuilder);
  registrationFrom: FormGroup;

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
        validators: [Validators.required],
        updateOn: 'change'
      }],

      confirmPassword: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }],
    }); 
  }

  registrationValidation() {
    console.log(this.registrationFrom.value);
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
