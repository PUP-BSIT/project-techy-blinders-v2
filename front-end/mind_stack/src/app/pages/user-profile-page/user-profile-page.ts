import { Component } from '@angular/core';
import { SideBar } from '../../shared/components/side-bar/side-bar';
import { Router } from '@angular/router';
import { EditProfilePage } from "./edit-profile-page/edit-profile-page";

@Component({
  selector: 'app-user-profile-page',
  imports: [EditProfilePage],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss'
})
export class UserProfilePage {

  showEditModal = false;
  activeTab: 'overview' | 'account-settings' = 'overview';

  constructor(private route: Router) {}
  
  editProfile() {
    this.showEditModal = true;
  }

  closeModal() {
    this.showEditModal = false;
  }

  accountSetting() {
    this.route.navigate(['app/account-setting'])
  }
}