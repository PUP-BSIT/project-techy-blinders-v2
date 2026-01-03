import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { SideBar } from '../../../shared/components/side-bar/side-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-settings',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.scss'
})
export class AccountSettings {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  formBuilder = inject (FormBuilder);
  authService = inject(AuthService);
  loading: boolean = false;
  showSuccessPopup: boolean = false;
  errorMessage: string | null = null;
  accountSettingForm: FormGroup;

  constructor() {
    this.accountSettingForm = this.formBuilder.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
      confirm_password: ['', Validators.required]
    });
  }

  strongPasswordValidator(control: any) {
    const value = control.value || '';
    const errors: any = {};

    if (value.length < 8) {
      errors['minlength'] = true;
    }

    if (!/[A-Z]/.test(value)) {
      errors['uppercase'] = true;
    }

    if (!/[a-z]/.test(value)) {
      errors['lowercase'] = true;
    }

    if (!/[0-9]/.test(value)) {
      errors['number'] = true;
    }

    if (!/[!@#$%^&*(),.?{}|<>\[\]\/;_+=-]/.test(value)) {
      errors['special'] = true;
    }
    
    return Object.keys(errors).length ? errors : null;
  }

  accountSettingInformation() {
    if (this.accountSettingForm.invalid) return;

    const { current_password, new_password, confirm_password } = this.accountSettingForm.value;

    if (new_password !== confirm_password) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.authService.updatePassword(current_password, new_password).subscribe({
      next: (res: any) => {
        this.accountSettingForm.reset();
        this.loading = false;
        this.showSuccessPopup = true;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || err?.error || err?.message || 'Failed to update password';
        this.loading = false;
      }
    });
  }

  closeSuccessPopup() {
    this.showSuccessPopup = false;
    this.onCancel.emit();
  }

  cancel() {
    this.onCancel.emit();
  }

  get passwordControl() {
    return this.accountSettingForm.get('current_password');
  }

  get newPasswordControl() {
    return this.accountSettingForm.get('new_password');
  }

  get confirmPasswordControl() {
    return this.accountSettingForm.get('confirm_password');
  }
}