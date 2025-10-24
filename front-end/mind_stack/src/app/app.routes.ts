import { Routes } from '@angular/router';
import { AboutPage } from './pages/about-page/about-page';
import { ContactPage } from './pages/contact-page/contact-page';
import { Home } from './pages/home/home';

export const routes: Routes = [
    { path: 'home', component: Home },  
    { path: 'about', component: AboutPage },
    { path: 'contact', component: ContactPage },
    { path: '**', redirectTo: '' }  
];