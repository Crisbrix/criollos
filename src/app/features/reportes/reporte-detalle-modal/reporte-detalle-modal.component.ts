import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reporte-detalle-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reporte-detalle-modal.component.html',
  styleUrl: './reporte-detalle-modal.component.scss'
})
export class ReporteDetalleModalComponent {
  titulo: string = '';
  tipo: string = '';
  datos: any = null;

  constructor(
    public dialogRef: MatDialogRef<ReporteDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.titulo = data.titulo || 'Reporte';
    this.tipo = data.tipo || '';
    this.datos = data.datos || null;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  calcularTotal(): number {
    if (this.tipo === 'ventas-diarias' && this.datos?.ventas) {
      return this.datos.ventas.reduce((sum: number, v: any) => sum + parseFloat(v.total), 0);
    }
    if (this.tipo === 'productos-vendidos' && this.datos?.productos) {
      return this.datos.productos.reduce((sum: number, p: any) => sum + p.cantidadVendida, 0);
    }
    return 0;
  }

  calcularTotalIngresos(): number {
    if (this.tipo === 'productos-vendidos' && this.datos?.productos) {
      return this.datos.productos.reduce((sum: number, p: any) => sum + p.totalVentas, 0);
    }
    return 0;
  }

  getMetodoPagoTotal(metodo: string): number {
    if (this.tipo === 'cierre-caja' && this.datos?.ventas) {
      return this.datos.ventas
        .filter((v: any) => v.metodo_pago.toLowerCase() === metodo.toLowerCase())
        .reduce((sum: number, v: any) => sum + parseFloat(v.total), 0);
    }
    return 0;
  }
}
