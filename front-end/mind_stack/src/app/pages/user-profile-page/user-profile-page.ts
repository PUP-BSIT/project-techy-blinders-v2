import { Component } from '@angular/core';
import { SideBar } from '../../shared/components/side-bar/side-bar';

@Component({
  selector: 'app-user-profile-page',
  imports: [SideBar],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss'
})
export class UserProfilePage {

  activeTab: 'overview' | 'account-settings' = 'overview';

  constructor() {}

  onEditProfile() {
    // Click: Edit Component displayed
  }

  showOverview() {
    this.activeTab = 'overview';
    // Click: Overview Component displayed
  }

  showAccountSettings() {
    this.activeTab = 'account-settings';
    // Click: Account Settings Component displayed
  }
}