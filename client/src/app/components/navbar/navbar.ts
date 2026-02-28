import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  constructor(public authService: AuthService) { }

  logout() {
    this.authService.logout();
  }

  getAvatar(user: any): string {
    if (user?.profilePic && user.profilePic !== 'default-profile.png') return user.profilePic;
    return `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`;
  }
}
