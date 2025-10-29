import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavBar } from '../../shared/components/nav-bar/nav-bar';

@Component({
  selector: 'app-about-page',
  imports: [CommonModule, NavBar],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss'
})
export class AboutPage {

}
