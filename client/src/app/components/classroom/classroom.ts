import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ClassService } from '../../services/class.service';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './classroom.html',
  styleUrls: ['./classroom.css']
})
export class ClassroomComponent implements OnInit {
  @ViewChild('closeEditModalBtn') closeEditModalBtn!: ElementRef;
  classroom: any;
  posts: any[] = [];
  classId: string = '';
  isLoading = true;
  activeTab = 'stream';

  newPost: any = {
    title: '',
    content: '',
    type: 'note',
    dueDate: ''
  };
  isPosting = false;
  selectedFile: File | null = null;

  // Edit Post State
  editingPostId: string | null = null;
  editData: any = { title: '', content: '', dueDate: '' };
  isUpdating = false;

  get upcomingAssignments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.posts
      .filter(p => p.type === 'assignment' && p.dueDate && new Date(p.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.toastr.info(`File selected: ${this.selectedFile.name}`);
    }
  }

  constructor(
    private route: ActivatedRoute,
    private classService: ClassService,
    private postService: PostService,
    public authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit() {
    this.classId = this.route.snapshot.paramMap.get('id') || '';
    if (this.classId) {
      this.loadClassData();
      this.loadPosts();
    }
  }

  loadClassData() {
    this.classService.getClass(this.classId).subscribe({
      next: (res) => this.classroom = res.data,
      error: (err) => this.toastr.error('Failed to load class details')
    });
  }

  loadPosts() {
    this.isLoading = true;
    this.postService.getPosts(this.classId).subscribe({
      next: (res) => {
        this.posts = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Failed to load posts');
        this.isLoading = false;
      }
    });
  }

  createPost() {
    if (!this.newPost.title || !this.newPost.content) return;
    this.isPosting = true;

    const formData = new FormData();
    formData.append('title', this.newPost.title);
    formData.append('content', this.newPost.content);
    formData.append('type', this.newPost.type);
    if (this.newPost.dueDate) formData.append('dueDate', this.newPost.dueDate);
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.postService.createPost(this.classId, formData).subscribe({
      next: (res) => {
        this.toastr.success('Post announced!');
        const freshPost = res.data;
        if (!freshPost.author || typeof freshPost.author === 'string') {
          freshPost.author = {
            name: this.authService.userValue.name,
            profilePic: this.authService.userValue.profilePic
          };
        }
        this.posts.unshift(freshPost);
        this.newPost = { title: '', content: '', type: 'note', dueDate: '' };
        this.selectedFile = null;
        this.isPosting = false;
      },
      error: (err) => {
        this.toastr.error('Failed to post');
        this.isPosting = false;
      }
    });
  }

  getAvatar(user: any): string {
    if (user?.profilePic && user.profilePic !== 'default-profile.png') return user.profilePic;
    return `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`;
  }

  getFileUrl(url: string): string {
    return `https://s074-classhub.onrender.com${url}`;
  }

  openPost(postId: string) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/class', this.classId, 'post', postId])
    );
    window.open(url, '_blank');
  }

  deletePost(postId: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.toastr.success('Post removed');
        // Update local array directly to avoid browser cache issues from loadPosts
        this.posts = this.posts.filter(p => p._id !== postId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete failure:', err);
        this.toastr.error('Failed to delete post');
      }
    });
  }

  likePost(post: any) {
    this.postService.likePost(post._id).subscribe({
      next: (res) => {
        post.likes = res.data;
      }
    });
  }

  addComment(post: any, commentText: string) {
    if (!commentText.trim()) return;
    this.postService.addComment(post._id, commentText).subscribe({
      next: (res) => {
        if (!post.comments) post.comments = [];
        post.comments.push(res.data);
      }
    });
  }

  isTeacher(): boolean {
    const role = this.authService.userValue?.role;
    return role === 'teacher' || role === 'admin';
  }

  isPostAuthor(post: any): boolean {
    const userId = this.authService.userValue?.id || this.authService.userValue?._id;
    const authorId = post.author?._id || post.author;
    return this.isTeacher() || userId === authorId;
  }

  removeStudent(studentId: string) {
    if (!confirm('Are you sure you want to remove this student?')) return;

    this.classService.removeStudent(this.classId, studentId).subscribe({
      next: () => {
        this.toastr.success('Student removed');
        this.classroom.students = this.classroom.students.filter((s: any) => s._id !== studentId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Remove student failure:', err);
        this.toastr.error('Failed to remove student');
      }
    });
  }

  // Edit Methods
  editPost(post: any) {
    this.editingPostId = post._id;
    this.editData = {
      title: post.title,
      content: post.content,
      dueDate: post.dueDate ? new Date(post.dueDate).toISOString().split('T')[0] : ''
    };
    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.editingPostId = null;
    this.editData = { title: '', content: '', dueDate: '' };
  }

  updatePost() {
    if (!this.editingPostId || this.isUpdating) {
      return;
    }

    const trimmedTitle = this.editData.title?.trim();
    const trimmedContent = this.editData.content?.trim();

    if (!trimmedTitle || !trimmedContent) {
      this.toastr.warning('Title and content are required');
      return;
    }

    this.isUpdating = true;
    console.log('[DEBUG] Starting update for post:', this.editingPostId);

    const payload = {
      title: trimmedTitle,
      content: trimmedContent,
      dueDate: this.editData.dueDate ? this.editData.dueDate : null
    };

    this.postService.updatePost(this.editingPostId, payload).subscribe({
      next: (res) => {
        console.log('[DEBUG] UI: Update success. Re-fetching posts.');
        this.toastr.success('Post updated!');

        // Update local array dynamically instead of full refetch caching issues
        const index = this.posts.findIndex(p => p._id === this.editingPostId);
        if (index !== -1) {
          const oldPost = this.posts[index];
          this.posts[index] = {
            ...oldPost,
            ...(res.data || {}),  // Fallback if data is missing
            title: payload.title, // Enforce correct title
            content: payload.content, // Enforce correct content
            dueDate: payload.dueDate, // Enforce correct due date
            author: oldPost.author,
            comments: oldPost.comments,
            likes: oldPost.likes
          };
          this.posts = [...this.posts];
          this.cdr.detectChanges();
        }

        this.isUpdating = false;
        this.closeEditModal();
      },
      error: (err) => {
        console.error('[DEBUG] Update API error:', err);
        this.toastr.error(err.error?.message || 'Failed to update post');
        this.isUpdating = false;
      }
    });
  }

  private closeEditModal() {
    this.cancelEdit();
    this.cdr.detectChanges();

    // Attempt multiple ways to close the modal
    setTimeout(() => {
      const btn = document.getElementById('closeEditModalBtn');
      if (btn) {
        console.log('[DEBUG] Triggering modal close via hidden button');
        btn.click();
      }
    }, 100);
  }
}
