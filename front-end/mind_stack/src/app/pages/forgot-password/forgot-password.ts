import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword {
  @Output() onCancel = new EventEmitter<void>();

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showSuccessPopup = signal(false);
  showErrorPopup = signal(false);
  errorPopupMessage = '';
  currentStep = signal(1);
  showNewPassword = false;
  showConfirmPassword = false;

  confirmPasswordFocused = signal(false);
  otpSent = signal(false);
  successPopupRedirect = signal(false);
  private successPopupTimer: any;

  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  forgotPasswordForm: FormGroup;

  constructor() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email], [this.emailRegisteredValidator()]],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
      confirmPassword: ['', Validators.required],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.forgotPasswordForm.get('confirmPassword')?.setValidators([
      Validators.required,
      this.matchPasswordsValidator.bind(this)
    ]);
    this.forgotPasswordForm.get('confirmPassword')?.updateValueAndValidity();
    this.forgotPasswordForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.forgotPasswordForm.get('confirmPassword')?.updateValueAndValidity({ emitEvent: false });
    });

  }

  emailRegisteredValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value || control.hasError('email')) {
        return Promise.resolve(null);
      }
      return this.authService.checkEmailExists(control.value).pipe(
        map((exists: boolean) => {
          if (!exists) {
            // error popup for unregistered email
            this.errorPopupMessage = 'Email not registered.';
            this.showErrorPopup.set(true);
          }
          return exists ? null : { emailNotRegistered: true };
        })
      );
    };
  }

  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
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

    if (!/[!@#$%^&*(),.?{}|<>\[\]\\/;_+=-]/.test(value)) {
      errors['special'] = true;
    }
    
    return Object.keys(errors).length ? errors : null;
  }

  matchPasswordsValidator(control: AbstractControl): ValidationErrors | null {
    const confirmPassword = control.value;
    const newPassword = this.forgotPasswordForm.get('newPassword')?.value;

    if (!confirmPassword || !newPassword) {
      return null;
    }

    return confirmPassword === newPassword ? null : { mustMatch: true };
  }

  next() {
    if (this.forgotPasswordForm.get('email')?.invalid ||
        this.forgotPasswordForm.get('newPassword')?.invalid ||
        this.forgotPasswordForm.get('confirmPassword')?.invalid) {
      return;
    }
    if (this.forgotPasswordForm.get('newPassword')?.value !== this.forgotPasswordForm.get('confirmPassword')?.value) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }
    this.errorMessage.set('');
    // check email if registered for OTP request
    this.isLoading.set(true);
    const email = this.forgotPasswordForm.get('email')?.value;
    this.authService.requestOtp({ email }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set('OTP sent to your email.');
          this.otpSent.set(true);
          this.currentStep.set(2);
        } else {
          const msg = (response.message || '').toLowerCase();
          if (msg.includes('not found') || msg.includes('unregistered') || msg.includes('no account')) {
            this.errorPopupMessage = 'Email not registered.';
            this.showErrorPopup.set(true);
          } else {
            this.errorMessage.set(response.message);
          }
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err && err.status === 404) {
          this.errorPopupMessage = 'Email not registered.';
          this.showErrorPopup.set(true);
        } else {
          this.errorMessage.set('Failed to send OTP. Please try again.');
        }
      }
    });
  }

  sendOtp() {
    this.errorMessage.set('');
    this.isLoading.set(true);
    const email = this.forgotPasswordForm.get('email')?.value;
    this.authService.requestOtp({ email }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set('OTP sent to your email.');
          this.otpSent.set(true);
          this.showSuccessPopup.set(true);
          this.successPopupRedirect.set(false);

          if (this.successPopupTimer) clearTimeout(this.successPopupTimer);
          this.successPopupTimer = 
          setTimeout(() => 
            this.closeSuccessPopup(),
            5000);
        } else {
          // check email is not registered
          const msg = (response.message || '').toLowerCase();
          if (msg.includes('not found') || msg.includes('unregistered') || msg.includes('no account')) {
            this.errorPopupMessage = 'Email not registered.';
            this.showErrorPopup.set(true);
          } else {
            this.errorMessage.set(response.message);
          }
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        // of 404 or similar for unregistered email
        if (err && err.status === 404) {
          this.errorPopupMessage = 'Email not registered.';
          this.showErrorPopup.set(true);
        } else {
          this.errorMessage.set('Failed to send OTP. Please try again.');
        }
      }
    });
  }


  resetPassword() {
    if (this.forgotPasswordForm.invalid) return;
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);
    const formValue = this.forgotPasswordForm.value;
    this.authService.resetPasswordWithOtp({
      email: formValue.email,
      otp: formValue.otp,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set(response.message || 'Password reset successful!');
          this.showSuccessPopup.set(true);
          this.successPopupRedirect.set(true);

          if (this.successPopupTimer) clearTimeout(this.successPopupTimer);
          this.successPopupTimer = 
          setTimeout(() => 
            this.closeSuccessPopup(), 
            5000);
        } else {
          this.errorPopupMessage = 'Invalid or wrong OTP. Please try again.';
          this.showErrorPopup.set(true);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err && err.status === 400) {
          this.errorPopupMessage = 'Invalid or wrong OTP. Please try again.';
        } else {
          this.errorPopupMessage = 'An error occurred. Please try again.';
        }
        this.showErrorPopup.set(true);
      }
    });
  }
  closeErrorPopup() {
    this.showErrorPopup.set(false);
    this.errorPopupMessage = '';
  }

  closeSuccessPopup() {
    if (this.successPopupTimer) {
      clearTimeout(this.successPopupTimer);
      this.successPopupTimer = undefined;
    }

    this.showSuccessPopup.set(false);

    if (this.successPopupRedirect()) {
      this.forgotPasswordForm.reset();
      this.currentStep.set(1);
      this.otpSent.set(false);
      this.router.navigate(['/login']);
    } else {
      this.successMessage.set('');
    }
  }

  private router = inject(Router);

  cancel() {
    this.forgotPasswordForm.reset();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.currentStep.set(1);
    this.otpSent.set(false);
    this.router.navigate(['/login']);
    this.onCancel.emit();
  }

  get emailControl() {
    return this.forgotPasswordForm.get('email');
  }

  get otpControl() {
    return this.forgotPasswordForm.get('otp');
  }

  get newPasswordControl() {
    return this.forgotPasswordForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.forgotPasswordForm.get('confirmPassword');
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  filterNumericInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');
    
    if (value.length > 6) {
      value = value.substring(0, 6);
    }
    
    input.value = value;
    this.forgotPasswordForm.get('otp')?.setValue(value, { emitEvent: false });
  }
}