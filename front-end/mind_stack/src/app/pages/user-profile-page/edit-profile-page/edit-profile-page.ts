import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { SideBar } from '../../../shared/components/side-bar/side-bar';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile-page',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './edit-profile-page.html',
  styleUrl: './edit-profile-page.scss'
})
export class EditProfilePage {
  @Output() onCancel = new EventEmitter<void>();

  formBuilder = inject (FormBuilder);

  editInformationForm: FormGroup;

  constructor() {
    this.editInformationForm = this.formBuilder.group({
      username: ['', {
        validators: [Validators.required],
        updateOn: 'change'
      }],
      email: ['', {
        validators: [Validators.required, Validators.email]
      }]
    });
  }

  editInformation() {
    console.log(this.editInformationForm.value);
    this.onCancel.emit();
  }

  cancel() {
    this.onCancel.emit();
  }
}