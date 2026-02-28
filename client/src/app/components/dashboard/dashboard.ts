import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClassService } from '../../services/class.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  classes: any[] = [];
  isLoading = true;
  user: any;

  // Create Class Modal Data
  newClass = {
    className: '',
    subject: '',
    section: '',
    category: 'General',
    description: ''
  };

  // Join Class Modal Data
  joinCode = '';

  constructor(
    private classService: ClassService,
    public authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) this.loadClasses();
    });
  }

  loadClasses() {
    this.isLoading = true;
    this.classService.getClasses().subscribe({
      next: (res) => {
        this.classes = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load classes');
        this.isLoading = false;
      }
    });
  }

  onCreateClass() {
    this.classService.createClass(this.newClass).subscribe({
      next: (res) => {
        this.toastr.success('Class created successfully!');
        this.loadClasses();
        // Clear form
        this.newClass = { className: '', subject: '', section: '', category: 'General', description: '' };
      },
      error: (err) => this.toastr.error(err.error.message || 'Error creating class')
    });
  }

  onJoinClass() {
    this.classService.joinClass(this.joinCode).subscribe({
      next: (res) => {
        this.toastr.success('Joined class successfully!');
        this.loadClasses();
        this.joinCode = '';
      },
      error: (err) => this.toastr.error(err.error.message || 'Invalid class code')
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
