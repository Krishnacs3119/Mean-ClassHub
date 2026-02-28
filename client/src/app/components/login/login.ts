import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
})
export class LoginComponent {
    credentials = {
        email: '',
        password: ''
    };
    isLoading = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private toastr: ToastrService
    ) { }

    onSubmit() {
        this.isLoading = true;
        this.authService.login(this.credentials).subscribe({
            next: (res) => {
                this.toastr.success('Welcome back, ' + res.user.name);
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.toastr.error(err.error.message || 'Login failed');
                this.isLoading = false;
            }
        });
    }
}
