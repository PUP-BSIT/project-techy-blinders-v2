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
  editEmailValue = '';
  isLoading = false;
  errorMessage = '';

  constructor(private route: Router, private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.editEmailValue = this.currentUser?.email || '';
  }
  
  editProfile() {
    this.showEditModal = true;
  }

  startEdit(type: 'email') {
    this.editingEmail = true;
    this.editEmailValue = this.currentUser?.email || '';
    this.errorMessage = '';
  }

  saveEdit(type: 'email') {
    if (!this.currentUser) return;
    
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.updateEmail(this.editEmailValue).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentUser!.email = this.editEmailValue;
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          this.editingEmail = false;
        } else {
          this.errorMessage = res.message || 'Failed to update email';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update email';
        this.isLoading = false;
      }
    });
  }

  closeModal() {
    this.showEditModal = false;
    this.showAccountSettingsModal = false;
  }

  accountSetting() {
    this.showAccountSettingsModal = true;
  }
}