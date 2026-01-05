import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Venta, VentaCreate, VentaDesdePedido } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  listar(filtros?: { estado?: string; metodoPago?: string; fechaInicio?: string; fechaFin?: string }): Observable<{ ventas: Venta[]; total: number }> {
    let params = new HttpParams();
    
    if (filtros?.estado) params = params.set('estado', filtros.estado);
    if (filtros?.metodoPago) params = params.set('metodoPago', filtros.metodoPago);
    if (filtros?.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params = params.set('fechaFin', filtros.fechaFin);

    return this.http.get<{ ventas: Venta[]; total: number }>(this.apiUrl, { params });
  }

  obtenerPorId(id: string): Observable<{ venta: Venta }> {
    return this.http.get<{ venta: Venta }>(`${this.apiUrl}/${id}`);
  }

  crear(venta: VentaCreate): Observable<{ message: string; venta: Venta }> {
    return this.http.post<{ message: string; venta: Venta }>(this.apiUrl, venta);
  }

  crearDesdePedido(data: VentaDesdePedido): Observable<{ message: string; venta: Venta }> {
    return this.http.post<{ message: string; venta: Venta }>(`${this.apiUrl}/desde-pedido`, data);
  }

  cancelar(id: string, motivo?: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/cancelar`, { motivo });
  }
}
