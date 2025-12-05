import { Component, OnInit } from '@angular/core';
import { SideBar } from '../../shared/components/side-bar/side-bar';
import { Router } from '@angular/router';
import { EditProfilePage } from "./edit-profile-page/edit-profile-page";
import { AccountSettings } from "./account-settings/account-settings";
import { AuthService } from '../../../service/auth.service';
import { LoginResponse } from '../../models/user.model';

type ModalType = 'edit-profile' | 'account-settings' | null;

@Component({
  selector: 'app-user-profile-page',
  imports: [EditProfilePage, AccountSettings],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss'
})
export class UserProfilePage implements OnInit {

  showEditModal = false;
  showAccountSettingsModal = false;
  
  activeTab: 'overview' | 'account-settings' = 'overview';
  currentUser: LoginResponse | null = null;

  constructor(private route: Router, private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }
  
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