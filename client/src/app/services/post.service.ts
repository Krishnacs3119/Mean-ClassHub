import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private apiUrl = 'https://s074-classhub.onrender.com/api';

    constructor(private http: HttpClient) { }

    getPosts(classId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/classes/${classId}/posts`);
    }

    createPost(classId: string, postData: any): Observable<any> {
        // If postData is FormData, Angular will handle content-type automatically
        return this.http.post(`${this.apiUrl}/classes/${classId}/posts`, postData);
    }

    likePost(postId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/posts/${postId}/like`, {});
    }

    addComment(postId: string, text: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/posts/${postId}/comments`, { text });
    }

    pinPost(postId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/posts/${postId}/pin`, {});
    }

    deletePost(postId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/posts/${postId}`);
    }

    updatePost(postId: string, postData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/posts/${postId}`, postData);
    }
}
