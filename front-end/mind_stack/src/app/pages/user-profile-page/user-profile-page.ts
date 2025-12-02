import { Component } from '@angular/core';
import { SideBar } from '../../shared/components/side-bar/side-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile-page',
  imports: [SideBar],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss'
})
export class UserProfilePage {

  activeTab: 'overview' | 'account-settings' = 'overview';

  constructor(private route: Router) {}
  
  editProfile() {
    this.route.navigate(['app/edit-profile-setting']);
  }

  accountSetting() {
    this.route.navigate(['app/account-setting'])
  }
}