import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ClassService {
    private apiUrl = 'https://s074-classhub.onrender.com/api/classes';

    constructor(private http: HttpClient) { }

    getClasses(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getClass(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createClass(classData: any): Observable<any> {
        return this.http.post(this.apiUrl, classData);
    }

    joinClass(classCode: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/join`, { classCode });
    }

    leaveClass(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}/leave`);
    }

    removeStudent(classId: string, studentId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${classId}/students/${studentId}`);
    }
}
