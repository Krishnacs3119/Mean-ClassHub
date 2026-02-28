import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5000/api/auth';
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        const token = localStorage.getItem('token');
        if (token) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            this.currentUserSubject.next(user);
        }

        // Sync auth state across tabs
        window.addEventListener('storage', (event) => {
            if (event.key === 'token') {
                if (!event.newValue) {
                    this.logout();
                }
            }
            if (event.key === 'user' && event.newValue) {
                this.currentUserSubject.next(JSON.parse(event.newValue));
            }
        });
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData).pipe(
            tap((res: any) => this.setSession(res))
        );
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => this.setSession(res))
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    updateProfile(userData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/updatedetails`, userData).pipe(
            tap((res: any) => {
                const updatedUser = { ...this.userValue, ...res.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                this.currentUserSubject.next(updatedUser);
            })
        );
    }

    getMe(): Observable<any> {
        return this.http.get(`${this.apiUrl}/me`);
    }

    private setSession(res: any) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    get userValue() {
        return this.currentUserSubject.value;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    hasRole(role: string): boolean {
        return this.userValue?.role === role;
    }
}
