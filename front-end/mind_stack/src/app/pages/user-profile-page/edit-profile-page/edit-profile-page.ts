import { Component, signal } from '@angular/core';
import { SideBar } from '../../../shared/components/side-bar/side-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile-page',
  imports: [SideBar, FormsModule],
  templateUrl: './edit-profile-page.html',
  styleUrl: './edit-profile-page.scss'
})
export class EditProfilePage {
  fullName = signal('');
  username = signal('');
  email = signal('');
  bio = signal('');

  constructor() {}

  onCancel() {
    this.fullName.set('');
    this.username.set('');
    this.email.set('');
    this.bio.set('');
  }

  onSave() {
    const updatedUser = {
      fullName: this.fullName(),
      username: this.username(),
      email: this.email(),
      bio: this.bio()
    };

    // Waiting on API
  }
}