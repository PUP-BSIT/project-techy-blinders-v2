import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.scss']
})
export class SideBar {
  
  constructor(private router: Router) {}

  onLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    this.router.navigate(['/']);
    
    console.log('User logged out successfully');
  }
}