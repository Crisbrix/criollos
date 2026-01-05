import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mesa-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './mesa-detalle.component.html',
  styleUrl: './mesa-detalle.component.scss'
})
export class MesaDetalleComponent implements OnInit {
  pedido: any = null;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<MesaDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mesa: any },
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarPedido();
  }

  cargarPedido(): void {
    this.loading = true;
    
    // Simular datos del pedido - luego conectaremos al backend
    setTimeout(() => {
      this.pedido = {
        id: 1,
        mesa: this.data.mesa.nombre,
        mesero: 'Juan Pérez',
        fecha: new Date(),
        estado: 'abierto',
        detalles: [
          {
            id: 1,
            producto_nombre: 'Bandeja Paisa',
            cantidad: 2,
            precio_unitario: 25000,
            subtotal: 50000,
            notas: 'Sin chicharrón'
          },
          {
            id: 2,
            producto_nombre: 'Ajiaco',
            cantidad: 1,
            precio_unitario: 18000,
            subtotal: 18000,
            notas: ''
          },
          {
            id: 3,
            producto_nombre: 'Arepa con Queso',
            cantidad: 3,
            precio_unitario: 8000,
            subtotal: 24000,
            notas: ''
          }
        ],
        total: 92000
      };
      this.loading = false;
    }, 500);
  }

  calcularTotal(): number {
    if (!this.pedido || !this.pedido.detalles) return 0;
    return this.pedido.detalles.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  }

  cerrarPedido(): void {
    if (confirm('¿Deseas cerrar este pedido y generar la cuenta?')) {
      this.snackBar.open('Pedido cerrado exitosamente', 'Cerrar', { duration: 3000 });
      this.dialogRef.close(true);
    }
  }

  imprimirCuenta(): void {
    this.snackBar.open('Imprimiendo cuenta...', 'Cerrar', { duration: 2000 });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
