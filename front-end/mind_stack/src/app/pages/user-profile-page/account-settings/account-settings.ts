import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { SideBar } from '../../../shared/components/side-bar/side-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-account-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.scss'
})
export class AccountSettings {
  @Output() onCancel = new EventEmitter<void>();

  formBuilder = inject (FormBuilder);
  accountSettingForm: FormGroup;

  constructor() {
    this.accountSettingForm = this.formBuilder.group({
      current_password: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }],

      new_password: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }],

      confirm_password: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }]
    });
  }

  accountSettingInformation() {
    console.log(this.accountSettingForm);
    this.onCancel.emit();
  }

  cancel() {
    this.onCancel.emit();
  }

}