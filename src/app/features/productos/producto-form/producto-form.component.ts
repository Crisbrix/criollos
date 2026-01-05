import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductosService } from '../../../core/services/productos.service';
import { Producto, ProductoCreate } from '../../../core/models/producto.model';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.scss'
})
export class ProductoFormComponent implements OnInit {
  producto: any = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: ''
  };

  categorias = [
    { value: 'plato_fuerte', label: 'Plato Fuerte', icon: 'restaurant' },
    { value: 'entrada', label: 'Entrada', icon: 'tapas' },
    { value: 'bebida', label: 'Bebida', icon: 'local_bar' },
    { value: 'postre', label: 'Postre', icon: 'cake' },
    { value: 'otro', label: 'Otro', icon: 'more_horiz' }
  ];

  isEdit = false;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ProductoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { producto?: Producto },
    private productosService: ProductosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.data?.producto) {
      this.isEdit = true;
      const p = this.data.producto;
      this.producto = {
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock || 0,
        categoria: (p as any).categoria || ''
      };
    }
  }

  guardar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;

    if (this.isEdit && this.data?.producto) {
      // Actualizar
      const productoId = this.data.producto.id.toString();
      console.log('Actualizando producto ID:', productoId);
      console.log('Datos a actualizar:', this.producto);
      
      this.productosService.actualizar(productoId, this.producto).subscribe({
        next: (response) => {
          console.log('Producto actualizado:', response);
          this.snackBar.open('Producto actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al actualizar producto:', error);
          const mensaje = error.error?.error || error.error?.message || 'Error al actualizar producto';
          this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      // Crear
      console.log('Enviando producto:', this.producto);
      this.productosService.crear(this.producto).subscribe({
        next: (response) => {
          this.snackBar.open('Producto creado correctamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al crear producto:', error);
          const mensaje = error.error?.error || error.error?.message || 'Error al crear producto';
          this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  validarFormulario(): boolean {
    if (!this.producto.nombre || this.producto.nombre.trim() === '') {
      this.snackBar.open('El nombre es requerido', 'Cerrar', { duration: 3000 });
      return false;
    }

    if (!this.producto.categoria || this.producto.categoria === '') {
      this.snackBar.open('La categoría es requerida', 'Cerrar', { duration: 3000 });
      return false;
    }

    if (this.producto.precio <= 0) {
      this.snackBar.open('El precio debe ser mayor a 0', 'Cerrar', { duration: 3000 });
      return false;
    }

    if (this.producto.stock !== undefined && this.producto.stock < 0) {
      this.snackBar.open('El stock no puede ser negativo', 'Cerrar', { duration: 3000 });
      return false;
    }

    return true;
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
