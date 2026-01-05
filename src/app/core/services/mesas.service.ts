import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MesasService {
  private apiUrl = `${environment.apiUrl}/mesas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<{ mesas: any[]; total: number }> {
    return this.http.get<{ mesas: any[]; total: number }>(this.apiUrl);
  }

  obtenerPorId(id: string): Observable<{ mesa: any }> {
    return this.http.get<{ mesa: any }>(`${this.apiUrl}/${id}`);
  }

  crear(mesa: any): Observable<{ message: string; mesa: any }> {
    return this.http.post<{ message: string; mesa: any }>(this.apiUrl, mesa);
  }

  actualizar(id: string, mesa: any): Observable<{ message: string; mesa: any }> {
    return this.http.put<{ message: string; mesa: any }>(`${this.apiUrl}/${id}`, mesa);
  }

  eliminar(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
