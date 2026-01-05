import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VentasService } from '../../../core/services/ventas.service';
import { PedidosService } from '../../../core/services/pedidos.service';

@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './venta-form.component.html',
  styleUrl: './venta-form.component.scss'
})
export class VentaFormComponent implements OnInit {
  pedidos: any[] = [];
  pedidoSeleccionado: any = null;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' = 'efectivo';
  observaciones: string = '';
  montoRecibido: number = 0;
  cambio: number = 0;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<VentaFormComponent>,
    private ventasService: VentasService,
    private pedidosService: PedidosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarPedidosListos();
  }

  cargarPedidosListos(): void {
    this.loading = true;
    this.pedidosService.listar().subscribe({
      next: (response) => {
        console.log('Todos los pedidos:', response.pedidos);
        console.log('Estados de pedidos:', response.pedidos.map((p: any) => ({ id: p.id, estado: p.estado })));
        
        // Solo pedidos en estado "listo" (listos para cobrar)
        this.pedidos = response.pedidos.filter((p: any) => p.estado === 'listo');
        
        console.log('Pedidos listos para cobrar:', this.pedidos);
        
        if (this.pedidos.length === 0) {
          this.snackBar.open('No hay pedidos listos para cobrar. Marca un pedido como "Listo" en Cocina primero.', 'Cerrar', { duration: 5000 });
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al cargar pedidos:', error);
        this.snackBar.open('Error al cargar pedidos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  seleccionarPedido(pedido: any): void {
    this.pedidoSeleccionado = pedido;
  }

  calcularCambio(): void {
    if (this.pedidoSeleccionado && this.montoRecibido) {
      this.cambio = this.montoRecibido - this.pedidoSeleccionado.total;
    } else {
      this.cambio = 0;
    }
  }

  getCambio(): number {
    return this.cambio;
  }

  crearVenta(): void {
    if (!this.pedidoSeleccionado) {
      this.snackBar.open('Debe seleccionar un pedido', 'Cerrar', { duration: 3000 });
      return;
    }

    // Validar monto recibido si es efectivo
    if (this.metodo_pago === 'efectivo') {
      if (!this.montoRecibido || this.montoRecibido <= 0) {
        this.snackBar.open('Debe ingresar el monto recibido', 'Cerrar', { duration: 3000 });
        return;
      }
      if (this.montoRecibido < this.pedidoSeleccionado.total) {
        this.snackBar.open('El monto recibido es insuficiente', 'Cerrar', { duration: 3000 });
        return;
      }
    }

    this.loading = true;

    const ventaData = {
      pedido_id: this.pedidoSeleccionado.id,
      metodo_pago: this.metodo_pago,
      observaciones: this.observaciones || undefined
    };

    this.ventasService.crearDesdePedido(ventaData).subscribe({
      next: (response) => {
        // Mostrar mensaje con cambio si es efectivo
        if (this.metodo_pago === 'efectivo' && this.cambio > 0) {
          this.snackBar.open(
            `✅ Venta completada. Cambio: $${this.cambio.toLocaleString()}`, 
            'Cerrar', 
            { duration: 5000 }
          );
        } else {
          this.snackBar.open('✅ Venta creada exitosamente', 'Cerrar', { duration: 3000 });
        }
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al crear venta:', error);
        const mensaje = error.error?.error || 'Error al crear venta';
        this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', { duration: 4000 });
      }
    });
  }

  cancelar(): void {
    if (this.pedidoSeleccionado && confirm('¿Desea cancelar la venta?')) {
      this.dialogRef.close(false);
    } else if (!this.pedidoSeleccionado) {
      this.dialogRef.close(false);
    }
  }
}
