import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, PedidoCreate, EstadoPedido } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  listar(filtros?: { estado?: string; numeroMesa?: number }): Observable<{ pedidos: Pedido[]; total: number }> {
    let params = new HttpParams();
    
    if (filtros?.estado) params = params.set('estado', filtros.estado);
    if (filtros?.numeroMesa) params = params.set('numeroMesa', filtros.numeroMesa.toString());

    return this.http.get<{ pedidos: Pedido[]; total: number }>(this.apiUrl, { params });
  }

  obtenerPorId(id: string): Observable<{ pedido: Pedido }> {
    return this.http.get<{ pedido: Pedido }>(`${this.apiUrl}/${id}`);
  }

  crear(pedido: PedidoCreate): Observable<{ message: string; pedido: Pedido }> {
    return this.http.post<{ message: string; pedido: Pedido }>(this.apiUrl, pedido);
  }

  actualizar(id: string, pedido: Partial<PedidoCreate>): Observable<{ message: string; pedido: Pedido }> {
    return this.http.put<{ message: string; pedido: Pedido }>(`${this.apiUrl}/${id}`, pedido);
  }

  cambiarEstado(id: string, estado: EstadoPedido): Observable<{ message: string; pedido: Pedido }> {
    return this.http.put<{ message: string; pedido: Pedido }>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  adicionarProductos(id: string, data: { productos: any[] }): Observable<{ message: string; pedido: Pedido }> {
    return this.http.post<{ message: string; pedido: Pedido }>(`${this.apiUrl}/${id}/adicionar`, data);
  }

  cancelar(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
