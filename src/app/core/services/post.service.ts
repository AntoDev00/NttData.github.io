import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly API_URL = 'https://gorest.co.in/public/v2/posts';
  private readonly USER_API_URL = 'https://gorest.co.in/public/v2/users';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getPosts(page: number = 1, perPage: number = 10, title?: string): Observable<Post[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (title) {
      params = params.set('title', title);
    }
    
    const token = this.authService.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
    
    // Stampiamo dei log per debug
    console.log('Richiesta API posts con parametri:', { page, perPage, token: !!token });
    
    return this.http.get<Post[]>(this.API_URL, { 
      params, 
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.API_URL}/${id}`);
  }

  getUserPosts(userId: number, page: number = 1, perPage: number = 10): Observable<Post[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    return this.http.get<Post[]>(`${this.USER_API_URL}/${userId}/posts`, { params });
  }

  createPost(post: Omit<Post, 'id'>): Observable<Post> {
    return this.http.post<Post>(this.API_URL, post);
  }

  updatePost(id: number, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.API_URL}/${id}`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
