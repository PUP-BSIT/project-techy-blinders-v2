import { Component, inject } from '@angular/core';
import { NavBar } from '../../shared/components/nav-bar/nav-bar';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';

interface Contact {
  name: string;
  email: string;
  message: string;
}

@Component({
  selector: 'app-contact-page',
  imports: [NavBar, ReactiveFormsModule],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss'
})
export class ContactPage {
  formBuilder = inject(FormBuilder);
  contactForm: FormGroup;

  constructor() {
    this.contactForm = this.formBuilder.group ({
      name: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }],

      email: ['', {
        validators: [Validators.required, Validators.email],
        updateOn: 'change'
      }],

      message: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }]
    })
  }

  contactValidation () {
    console.log(this.contactForm.value);
  }

  get nameControl () {
    return this.contactForm.get('name');
  }

  get emailControl () {
    return this.contactForm.get('email');
  }

  get messageControl () {
    return this.contactForm.get('message');
  }
}
