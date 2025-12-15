import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  @Output() onCancel = new EventEmitter<void>();

  showForgotPasswordModal = false;

  formBuilder = inject (FormBuilder);
  forgotPasswordForm: FormGroup;

  constructor() {
    this.forgotPasswordForm = this.formBuilder.group ({
      email: ['', {
        validators: [Validators.required, Validators.email],
        updateOn: 'change'
      }],

      newPassword: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }],

      confirmPassword: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }]
    });
  }

  forgotPassword() {
    console.log(this.forgotPasswordForm.value);
  }

  cancel() {
    this.onCancel.emit();
  }

}
