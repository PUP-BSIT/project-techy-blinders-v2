import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../../../service/auth.service';
import { LoginResponse } from '../../../models/user.model';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatSidenavModule],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.scss']
})
export class SideBar implements OnInit {
  isCollapsed = false;
  @Output() sidebarToggled = new EventEmitter<boolean>();
  
  currentUser: LoginResponse | null = null;
  userName: string = 'User';
  userEmail: string = '';
  userInitial: string = 'U';
  
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.userName = user.username || 'User';
        this.userEmail = user.email || '';
        this.userInitial = this.userName.charAt(0).toUpperCase();
      }
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggled.emit(this.isCollapsed);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
    console.log('User logged out successfully');
  }
}