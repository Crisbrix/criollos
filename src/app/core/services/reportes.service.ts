import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  ventasDiarias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventas-diarias`);
  }

  ventasPeriodo(fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    
    return this.http.get(`${this.apiUrl}/ventas-periodo`, { params });
  }

  productosVendidos(fechaInicio?: string, fechaFin?: string, limite?: number): Observable<any> {
    let params = new HttpParams();
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (limite) params = params.set('limite', limite.toString());

    return this.http.get(`${this.apiUrl}/productos-vendidos`, { params });
  }

  cierreCaja(fecha?: string): Observable<any> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    
    return this.http.get(`${this.apiUrl}/cierre-caja`, { params });
  }

  inventario(tipo?: string, stockBajo?: boolean): Observable<any> {
    let params = new HttpParams();
    
    if (tipo) params = params.set('tipo', tipo);
    if (stockBajo !== undefined) params = params.set('stockBajo', stockBajo.toString());

    return this.http.get(`${this.apiUrl}/inventario`, { params });
  }

  ventasPorDia(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventas-por-dia`);
  }
}
