import { Component, signal } from '@angular/core';
import { SideBar } from '../../../shared/components/side-bar/side-bar';

@Component({
  selector: 'app-account-settings',
  imports: [SideBar],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.scss'
})
export class AccountSettings {
  currentPassword = signal('');
  newPassword = signal('');

  constructor() {}

  onCancel() {
    this.currentPassword.set('');
    this.newPassword.set('');
  }

  onSave() {
    const changePassword = {
      currentPassword: this.currentPassword(),
      newPassword: this.newPassword()
    };
    // Waiting on API
  }

  onDeleteAccount() {
    // Waiting on API
  }
}