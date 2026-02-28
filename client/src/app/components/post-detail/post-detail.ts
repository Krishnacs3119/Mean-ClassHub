import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-post-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './post-detail.html',
    styleUrls: ['./post-detail.css']
})
export class PostDetailComponent implements OnInit {
    post: any;
    postId: string = '';
    classId: string = '';
    isLoading = true;

    // Submission
    submission: any = null;
    newSubmission: any = { content: '' };
    isSubmitting = false;

    // Teacher view of submissions
    allSubmissions: any[] = [];
    gradingData: any = { grade: '', feedback: '' };
    selectedSubmission: any = null;

    constructor(
        private route: ActivatedRoute,
        private postService: PostService,
        public authService: AuthService,
        private toastr: ToastrService,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.postId = this.route.snapshot.paramMap.get('postId') || '';
        this.classId = this.route.snapshot.paramMap.get('id') || '';
        if (this.postId) {
            this.loadPost();
            this.loadSubmission();
        }
    }

    loadPost() {
        this.isLoading = true;
        // We can use getPosts and filter, or a direct single post get if implemented
        // Since getPosts is already there in postService, I'll find the single one
        this.postService.getPosts(this.classId).subscribe({
            next: (res) => {
                this.post = res.data.find((p: any) => p._id === this.postId);
                this.isLoading = false;
                if (!this.post) this.toastr.error('Post not found');
            },
            error: (err) => {
                this.toastr.error('Failed to load post');
                this.isLoading = false;
            }
        });
    }

    loadSubmission() {
        const url = `http://localhost:5000/api/posts/${this.postId}/submissions`;
        this.http.get<any>(url).subscribe({
            next: (res) => {
                if (this.isTeacher()) {
                    this.allSubmissions = res.data || [];
                } else {
                    this.submission = res.data;
                }
            },
            error: (err) => console.error('Failed to load submissions', err)
        });
    }

    submitAssignment() {
        if (!this.newSubmission.content.trim()) return;
        this.isSubmitting = true;
        const url = `http://localhost:5000/api/posts/${this.postId}/submissions`;
        this.http.post<any>(url, this.newSubmission).subscribe({
            next: (res) => {
                this.toastr.success('Assignment submitted!');
                this.submission = res.data;
                this.isSubmitting = false;
            },
            error: (err) => {
                this.toastr.error(err.error?.message || 'Failed to submit');
                this.isSubmitting = false;
            }
        });
    }

    gradeSubmission(subId: string) {
        const url = `http://localhost:5000/api/posts/submissions/${subId}/grade`;
        this.http.put<any>(url, this.gradingData).subscribe({
            next: (res) => {
                this.toastr.success('Graded successfully');
                const index = this.allSubmissions.findIndex(s => s._id === subId);
                if (index !== -1) this.allSubmissions[index] = res.data;
                this.selectedSubmission = null;
            },
            error: (err) => this.toastr.error('Failed to grade')
        });
    }

    isTeacher(): boolean {
        return this.authService.userValue?.role === 'teacher' || this.authService.userValue?.role === 'admin';
    }

    getAvatar(user: any): string {
        if (user?.profilePic && user.profilePic !== 'default-profile.png') return user.profilePic;
        return `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`;
    }

    closeTab() {
        window.close();
    }
}
