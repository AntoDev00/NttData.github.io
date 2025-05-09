import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly API_URL = 'https://gorest.co.in/public/v2/comments';
  private readonly POST_API_URL = 'https://gorest.co.in/public/v2/posts';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getComments(page: number = 1, perPage: number = 10): Observable<Comment[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    return this.http.get<Comment[]>(this.API_URL, { params });
  }

  getCommentById(id: number): Observable<Comment> {
    return this.http.get<Comment>(`${this.API_URL}/${id}`);
  }

  getPostComments(postId: number, page: number = 1, perPage: number = 10): Observable<Comment[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    return this.http.get<Comment[]>(`${this.POST_API_URL}/${postId}/comments`, { params });
  }

  createComment(comment: Omit<Comment, 'id'>): Observable<Comment> {
    return this.http.post<Comment>(this.API_URL, comment);
  }

  updateComment(id: number, comment: Partial<Comment>): Observable<Comment> {
    return this.http.put<Comment>(`${this.API_URL}/${id}`, comment);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
