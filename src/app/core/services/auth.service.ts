import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'criollos_token';
  private userKey = 'criollos_user';
  
  currentUser = signal<Usuario | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('🔑 Login response:', response);
          console.log('🔑 Token recibido:', response.token);
          
          if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            localStorage.setItem(this.userKey, JSON.stringify(response.usuario));
            this.currentUser.set(response.usuario);
            this.isAuthenticated.set(true);
            
            console.log('✅ Token guardado en localStorage');
            console.log('✅ Usuario autenticado:', response.usuario);
          } else {
            console.error('❌ No se recibió token en la respuesta');
          }
        })
      );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getProfile(): Observable<{ usuario: Usuario }> {
    return this.http.get<{ usuario: Usuario }>(`${this.apiUrl}/me`);
  }

  cambiarPassword(passwordActual: string, passwordNuevo: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/cambiar-password`, {
      passwordActual,
      passwordNuevo
    });
  }

  hasRole(...roles: number[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.rol_id) : false;
  }
}
