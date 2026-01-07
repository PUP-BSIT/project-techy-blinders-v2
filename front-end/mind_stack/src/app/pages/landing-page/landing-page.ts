import { Component, signal } from '@angular/core';
import { NavBar } from '../../shared/components/nav-bar/nav-bar';
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [NavBar],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {
  constructor (private router: Router) {
  }

  onStartNow () {
    this.router.navigate(['register']);
  }

  onLogin() {
    this.router.navigate(['login']);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }
}