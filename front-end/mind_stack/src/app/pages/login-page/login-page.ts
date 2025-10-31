import { Component } from '@angular/core';
import { NavBar } from "../../shared/components/nav-bar/nav-bar";
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [NavBar, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage {

}
