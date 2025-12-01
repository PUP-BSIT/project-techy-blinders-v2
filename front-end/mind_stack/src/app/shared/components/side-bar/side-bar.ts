import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatSidenavModule],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.scss']
})
export class SideBar {
  isCollapsed = false;
  @Output() sidebarToggled = new EventEmitter<boolean>();
  
  constructor(private router: Router) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggled.emit(this.isCollapsed);
  }

  onLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    this.router.navigate(['/']);
    
    console.log('User logged out successfully');
  }
}