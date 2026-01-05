import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Configuracion {
  id?: string;
  nombreRestaurante: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo?: string;
  ruc?: string;
  igv: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private apiUrl = `${environment.apiUrl}/configuracion`;

  constructor(private http: HttpClient) {}

  obtener(): Observable<{ configuracion: Configuracion }> {
    return this.http.get<{ configuracion: Configuracion }>(this.apiUrl);
  }

  actualizar(configuracion: Partial<Configuracion>): Observable<{ message: string; configuracion: Configuracion }> {
    return this.http.put<{ message: string; configuracion: Configuracion }>(this.apiUrl, configuracion);
  }
}
