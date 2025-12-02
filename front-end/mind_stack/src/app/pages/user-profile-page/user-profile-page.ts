import { Component } from '@angular/core';
import { SideBar } from '../../shared/components/side-bar/side-bar';
import { Router } from '@angular/router';
import { EditProfilePage } from "./edit-profile-page/edit-profile-page";
import { AccountSettings } from "./account-settings/account-settings";

type ModalType = 'edit-profile' | 'account-settings' | null;

@Component({
  selector: 'app-user-profile-page',
  imports: [EditProfilePage, AccountSettings],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss'
})
export class UserProfilePage {

  showEditModal = false;
  showAccountSettingsModal = false;
  
  activeTab: 'overview' | 'account-settings' = 'overview';

  constructor(private route: Router) {}
  
  editProfile() {
    this.showEditModal = true;
  }

  closeModal() {
    this.showEditModal = false;
    this.showAccountSettingsModal = false;
  }

  accountSetting() {
    this.showAccountSettingsModal = true;
  }

}