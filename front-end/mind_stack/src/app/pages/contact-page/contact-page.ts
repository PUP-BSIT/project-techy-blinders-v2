import { Component, inject } from '@angular/core';
import { NavBar } from '../../shared/components/nav-bar/nav-bar';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../service/contact.service';
import { response } from 'express';
import { error } from 'console';

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
  contactService = inject(ContactService)
  contactForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  isSubmitSuccess = false;
  submitPopupVisible = false;
  private submitPopupTimeout: any;

  showSubmitPopup() {
    return this.submitPopupVisible;
  }

  openSubmitPopup() {
    if (this.submitPopupTimeout) {
      clearTimeout(this.submitPopupTimeout);
      this.submitPopupTimeout = null;
    }

    this.submitPopupVisible = true;

    this.submitPopupTimeout = window.setTimeout(() => {
      this.closeSubmitPopup();
    }, 5000);
  }

  closeSubmitPopup() {
    this.submitPopupVisible = false;
    if (this.submitPopupTimeout) {
      clearTimeout(this.submitPopupTimeout);
      this.submitPopupTimeout = null;
    }
  }

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
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = '';

      this.contactService.sendContactForm(this.contactForm.value).subscribe({
        next: (response) => {
          this.isSubmitSuccess = true;
          this.submitMessage = response.message;
          this.contactForm.reset();
          this.openSubmitPopup();
          this.isSubmitting = false;
        },

        error: (error) => {
          this.isSubmitSuccess = false;
          this.submitMessage = 'Failed to send message';
          this.openSubmitPopup();
          this.isSubmitting = false;
        }
      });
    }else {
      this.contactForm.markAllAsTouched();
    }
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