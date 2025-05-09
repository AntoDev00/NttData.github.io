import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'https://gorest.co.in/public/v2/users';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getUsers(page: number = 1, perPage: number = 10, name?: string, email?: string): Observable<User[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (name) {
      params = params.set('name', name);
    }
    
    if (email) {
      params = params.set('email', email);
    }
    
    const token = this.authService.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
    
    console.log(`Richiesta utenti: page=${page}, perPage=${perPage}, token=${!!token}`);
    
    return this.http.get<User[]>(this.API_URL, { 
      params, 
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined 
    });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.API_URL, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
