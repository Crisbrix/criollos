import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, ProductoCreate } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  listar(filtros?: { tipo?: string; categoria?: string; activo?: boolean }): Observable<{ productos: Producto[]; total: number }> {
    let params = new HttpParams();
    
    if (filtros?.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros?.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros?.activo !== undefined) params = params.set('activo', filtros.activo.toString());

    return this.http.get<{ productos: Producto[]; total: number }>(this.apiUrl, { params });
  }

  obtenerPorId(id: string): Observable<{ producto: Producto }> {
    return this.http.get<{ producto: Producto }>(`${this.apiUrl}/${id}`);
  }

  crear(producto: ProductoCreate): Observable<{ message: string; producto: Producto }> {
    return this.http.post<{ message: string; producto: Producto }>(this.apiUrl, producto);
  }

  actualizar(id: string, producto: Partial<ProductoCreate>): Observable<{ message: string; producto: Producto }> {
    return this.http.put<{ message: string; producto: Producto }>(`${this.apiUrl}/${id}`, producto);
  }

  eliminar(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  actualizarStock(id: string, cantidad: number, operacion: 'sumar' | 'restar'): Observable<{ message: string; producto: Producto }> {
    return this.http.put<{ message: string; producto: Producto }>(`${this.apiUrl}/${id}/stock`, {
      cantidad,
      operacion
    });
  }
}
