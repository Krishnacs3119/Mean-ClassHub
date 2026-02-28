import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './profile.html',
    styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
    user: any;
    isEditing = false;
    editName = '';

    constructor(
        public authService: AuthService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        this.fetchProfile();
    }

    private fetchProfile() {
        this.authService.getMe().subscribe({
            next: (res) => {
                this.user = res.data;
                if (this.user) this.editName = this.user.name;
            },
            error: (err) => {
                this.toastr.error('Failed to load profile details');
                // Fallback to local storage user
                this.user = this.authService.userValue;
                if (this.user) this.editName = this.user.name;
            }
        });
    }

    toggleEdit() {
        this.isEditing = !this.isEditing;
        if (this.isEditing) this.editName = this.user.name;
    }

    saveName() {
        if (!this.editName.trim()) {
            this.toastr.warning('Name cannot be empty');
            return;
        }

        this.authService.updateProfile({ name: this.editName }).subscribe({
            next: () => {
                this.toastr.success('Profile updated');
                this.isEditing = false;
            },
            error: () => this.toastr.error('Failed to update profile')
        });
    }

    getAvatar(user: any): string {
        if (user?.profilePic && user.profilePic !== 'default-profile.png') return user.profilePic;
        return `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`;
    }
}
