import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  stats: {
    ventasHoy: number;
    pedidosActivos: number;
    productosVendidos: number;
    ingresoTotal: number;
  };
  ventasPorHora: {
    labels: string[];
    data: number[];
  };
  productosPopulares: Array<{
    nombre: string;
    cantidad: number;
  }>;
  pedidosRecientes: Array<{
    mesa: number;
    items: number;
    total: number;
    tiempo: string;
    estado: string;
  }>;
  mesasEstado: {
    disponibles: number;
    ocupadas: number;
    reservadas: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  obtenerEstadisticas(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
