import { Routes } from '@angular/router';
import { RenderMode } from '@angular/ssr';
import { ContactPage } from './pages/contact-page/contact-page';
import { LandingPage } from './pages/landing-page/landing-page';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { StudySetsPage } from './pages/study-sets-page/study-sets-page';
import { OpenStudySet } from './pages/study-sets-page/open-study-set/open-study-set';
import { QuizzesPage } from './pages/quizzes-page/quizzes-page';
import { CommunityPage } from './pages/community-page/community-page';
import { NotificationPage } from './pages/notification-page/notification-page';
import { AppLayout } from './shared/components/app-layout/app-layout';
import { LoginPage } from './pages/login-page/login-page';
import { RegistrationPage } from './pages/registration-page/registration-page';
import { OpenQuiz } from './pages/quizzes-page/open-quiz/open-quiz';
import { UserProfilePage } from './pages/user-profile-page/user-profile-page';
import { AccountSettings } from './pages/user-profile-page/account-settings/account-settings';
import { EditProfilePage } from './pages/user-profile-page/edit-profile-page/edit-profile-page';
import { AuthGuard } from '../guards/auth.guard';
import { ForgotPassword } from './pages/forgot-password/forgot-password';

declare module '@angular/router' {
    interface Route {
        renderMode?: RenderMode;
    }
}

export const routes: Routes = [
    {path: '', component: LandingPage },  
    {path: 'contact', component: ContactPage },
    {path: 'login', component: LoginPage},
    {path: 'register', component: RegistrationPage},
    {path: 'forgot-password', component: ForgotPassword},

    { 
        path: 'app',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardPage },
            { path: 'study-sets', component: StudySetsPage },
            {
                path: 'study-sets/:id',
                component: OpenStudySet,
                renderMode: RenderMode.Client
            },
            { path: 'quizzes', component: QuizzesPage },
            {
                path: 'quizzes/:id',
                component: OpenQuiz,
                renderMode: RenderMode.Client
            },
            { path: 'community', component: CommunityPage },
            { path: 'notifications', component: NotificationPage },
            { path: 'user-profile', component: UserProfilePage },
            { path: 'edit-profile-setting', component: EditProfilePage},
            { path: 'account-setting', component: AccountSettings}
        ]
    },

    { path: '**', redirectTo: '' }  
];