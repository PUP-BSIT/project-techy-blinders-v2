import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, inject, signal, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../../../service/auth.service';
import { NotificationService } from '../../../../service/notification.service';
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
  isMobileMenuOpen = false;
  isMobile = false;
  @Output() sidebarToggled = new EventEmitter<boolean>();
  @Output() mobileMenuToggled = new EventEmitter<boolean>();
  
  currentUser: LoginResponse | null = null;
  userName: string = 'User';
  userEmail: string = '';
  userInitial: string = 'U';
  unreadNotificationCount = signal<number>(0);
  
  logoutModalOpen = signal(false);

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  constructor() {
    // Subscribe to unread count after injection
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadNotificationCount.set(count);
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isMobileMenuOpen = false;
      this.mobileMenuToggled.emit(false);
    }
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
    if (this.isMobile) {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      this.mobileMenuToggled.emit(this.isMobileMenuOpen);
    } else {
      this.isCollapsed = !this.isCollapsed;
      this.sidebarToggled.emit(this.isCollapsed);
    }
  }

  closeMobileMenu() {
    if (this.isMobile && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      this.mobileMenuToggled.emit(false);
    }
  }

  onLogout() {
    this.logoutModalOpen.set(true);

    setTimeout(() => {
      this.authService.logout();
      this.logoutModalOpen.set(false);
      this.router.navigate(['/']);
    }, 1500);
  }
}