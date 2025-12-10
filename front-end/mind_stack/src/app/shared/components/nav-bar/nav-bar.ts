import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
  imports: [RouterLink]
})
export class NavBar {
  isMenuOpen = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  scrollToSection(sectionId: string) {
    // Check if we're already on the landing page
    if (this.router.url === '/' || this.router.url === '') {
      // We're on landing page, just scroll
      this.scrollToElement(sectionId);
    } else {
      // Navigate to landing page first, then scroll
      this.router.navigate(['/']).then(() => {
        // Wait a bit for the page to load
        setTimeout(() => {
          this.scrollToElement(sectionId);
        }, 100);
      });
    }
  }

  private scrollToElement(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}