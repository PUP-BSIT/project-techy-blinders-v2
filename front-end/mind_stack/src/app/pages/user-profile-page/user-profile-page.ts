import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountSettings } from "./account-settings/account-settings";
import { AuthService, UserProfile } from '../../../service/auth.service';
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
  displayUser: UserProfile | null = null;

  quizzesCreated = 0;
  flashcardSetsCreated = 0;
  totalLikes = 0;

  isOwnProfile = true;
  viewedUserId?: number;

  editingEmail = false;
  editEmailValue = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const loggedInUser = this.authService.getCurrentUser();
    this.currentUser = loggedInUser;

    this.route.paramMap.subscribe(params => {
      const userIdParam = params.get('userId');

      if (userIdParam) {
        const requestedId = Number(userIdParam);
        this.viewedUserId = requestedId;
        this.isOwnProfile = loggedInUser?.userId === requestedId;

        if (this.isOwnProfile) {
          this.editEmailValue = loggedInUser?.email || '';
          // Load profile data including milestones for own profile
          if (loggedInUser?.userId) {
            this.loadUserProfile(loggedInUser.userId);
          }
        } else {
          this.loadUserProfile(requestedId);
        }
      } else {
        this.isOwnProfile = true;
        this.viewedUserId = loggedInUser?.userId;
        this.editEmailValue = loggedInUser?.email || '';
        // Load profile data including milestones for own profile
        if (loggedInUser?.userId) {
          this.loadUserProfile(loggedInUser.userId);
        }
      }
    });
  }
  
  editProfile() {
    if (!this.isOwnProfile) return;
    this.showEditModal = true;
  }

  startEdit(type: 'email') {
    this.editingEmail = true;
    this.editEmailValue = this.displayUser?.email || '';
    this.errorMessage = '';
  }

  saveEdit(type: 'email') {
    if (!this.isOwnProfile) return;
    if (!this.currentUser) return;
    
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.updateEmail(this.editEmailValue).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentUser!.email = this.editEmailValue;
          this.displayUser!.email = this.editEmailValue;
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
    if (!this.isOwnProfile) return;
    this.showAccountSettingsModal = true;
  }

  private loadUserProfile(userId: number) {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getUserById(userId).subscribe({
      next: (profile: UserProfile) => {
        console.log('Loaded user profile:', profile);
        this.displayUser = profile;
        
        // Update milestones from API
        this.quizzesCreated = profile.quizzesCreated;
        this.flashcardSetsCreated = profile.flashcardSetsCreated;
        this.totalLikes = profile.totalLikes;
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load user profile:', err);
        this.errorMessage = 'Unable to load user profile';
        this.isLoading = false;
      }
    });
  }
}