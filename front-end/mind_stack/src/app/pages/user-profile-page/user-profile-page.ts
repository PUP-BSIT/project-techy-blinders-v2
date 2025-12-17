import { Component, OnInit } from '@angular/core';
import { SideBar } from '../../shared/components/side-bar/side-bar';
import { Router } from '@angular/router';
import { EditProfilePage } from "./edit-profile-page/edit-profile-page";
import { AccountSettings } from "./account-settings/account-settings";
import { AuthService } from '../../../service/auth.service';
import { LoginResponse } from '../../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

type ModalType = 'edit-profile' | 'account-settings' | null;

@Component({
  selector: 'app-user-profile-page',
  imports: [AccountSettings, FormsModule, CommonModule],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss'
})
export class UserProfilePage implements OnInit {

  showEditModal = false;
  showAccountSettingsModal = false;
  
  activeTab: 'overview' | 'account-settings' = 'overview';
  currentUser: LoginResponse | null = null;

  quizzesCreated = 3;
  flashcardSetsCreated = 4;
  totalLikes = 10;

  editingEmail = false;
  editingUsername = false;
  editEmailValue = '';
  editUsernameValue = '';

  constructor(private route: Router, private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.editEmailValue = this.currentUser?.email || '';
    this.editUsernameValue = this.currentUser?.username || '';
  }
  
  editProfile() {
    this.showEditModal = true;
  }

  startEdit(type: 'email' | 'username') {
    if (type === 'email') {
      this.editingEmail = true;
      this.editEmailValue = this.currentUser?.email || '';
    } else if (type === 'username') {
      this.editingUsername = true;
      this.editUsernameValue = this.currentUser?.username || '';
    }
  }

  saveEdit(type: 'email' | 'username') {
    if (!this.currentUser) return;
    if (type === 'email') {
      this.currentUser.email = this.editEmailValue;
      this.editingEmail = false;
    } else if (type === 'username') {
      this.currentUser.username = this.editUsernameValue;
      this.editingUsername = false;
    }
  }

  closeModal() {
    this.showEditModal = false;
    this.showAccountSettingsModal = false;
  }

  accountSetting() {
    this.showAccountSettingsModal = true;
  }
}