import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VentasService } from '../../../core/services/ventas.service';
import { Venta } from '../../../core/models/venta.model';
import { VentaFormComponent } from '../venta-form/venta-form.component';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './ventas-list.component.html',
  styleUrl: './ventas-list.component.scss'
})
export class VentasListComponent implements OnInit {
  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  loading = false;
  filtroMetodo: string = 'TODOS';

  constructor(
    private ventasService: VentasService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.loading = true;
    this.ventasService.listar().subscribe({
      next: (response) => {
        this.ventas = response.ventas;
        this.ventasFiltradas = [...this.ventas];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error al cargar ventas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getTotalIngresos(): number {
    return this.ventas
      .filter(v => v.estado === 'completada')
      .reduce((sum, v) => sum + parseFloat(v.total as any), 0);
  }

  getVentasPorMetodo(metodo: string): Venta[] {
    return this.ventas.filter(v => v.metodo_pago === metodo);
  }

  filtrarPorMetodo(metodo: string): void {
    this.filtroMetodo = metodo;
    if (metodo === 'TODOS') {
      this.ventasFiltradas = [...this.ventas];
    } else {
      this.ventasFiltradas = this.ventas.filter(v => v.metodo_pago === metodo);
    }
  }

  getMetodoClass(metodo: string): string {
    const classes: any = {
      'efectivo': 'metodo-efectivo',
      'tarjeta': 'metodo-tarjeta',
      'transferencia': 'metodo-transferencia'
    };
    return classes[metodo] || '';
  }

  getMetodoIcon(metodo: string): string {
    const icons: any = {
      'efectivo': 'money',
      'tarjeta': 'credit_card',
      'transferencia': 'account_balance'
    };
    return icons[metodo] || 'payments';
  }

  nuevaVenta(): void {
    const dialogRef = this.dialog.open(VentaFormComponent, {
      width: '700px',
      maxWidth: '95vw',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarVentas();
      }
    });
  }

  verDetalle(venta: Venta): void {
    // TODO: Abrir modal con detalle completo
    this.snackBar.open(`Ver detalle de venta #${venta.id}`, 'Cerrar', { duration: 2000 });
  }

  imprimirTicket(venta: Venta): void {
    // TODO: Implementar impresión de ticket
    this.snackBar.open(`Imprimiendo ticket #${venta.id}`, 'Cerrar', { duration: 2000 });
  }
}
