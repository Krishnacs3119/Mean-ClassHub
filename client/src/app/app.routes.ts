import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ClassroomComponent } from './components/classroom/classroom';
import { PostDetailComponent } from './components/post-detail/post-detail';
import { ProfileComponent } from './components/profile/profile';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

// Simple Auth Guard
const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.isLoggedIn()) return true;
    return router.navigate(['/login']);
};

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'class/:id', component: ClassroomComponent, canActivate: [authGuard] },
    { path: 'class/:id/post/:postId', component: PostDetailComponent, canActivate: [authGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: 'dashboard' }
];
