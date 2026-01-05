import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductosService } from '../../../core/services/productos.service';
import { Producto } from '../../../core/models/producto.model';
import { ProductoFormComponent } from '../producto-form/producto-form.component';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.scss'
})
export class ProductosListComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  loading = false;
  searchTerm: string = '';
  filtroTipo: string = 'TODOS';

  constructor(
    private productosService: ProductosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    console.log('Cargando productos...');
    this.productosService.listar().subscribe({
      next: (response) => {
        console.log('Productos recibidos:', response);
        this.productos = response.productos;
        this.productosFiltrados = [...this.productos];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar productos: ' + error.message, 'Cerrar', { duration: 5000 });
      }
    });
  }

  filtrarProductos(): void {
    let resultados = [...this.productos];

    // Filtrar por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      resultados = resultados.filter(p => 
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term))
      );
    }

    this.productosFiltrados = resultados;
  }

  filtrarPorTipo(tipo: string): void {
    this.filtroTipo = tipo;
    this.filtrarProductos();
  }

  get productosActivos(): number {
    return this.productos.length;
  }

  get productosStockBajo(): number {
    return this.productos.filter(p => p.stock < 10).length;
  }

  getTipoClass(tipo: string): string {
    const classes: any = {
      'PLATO': 'tipo-plato',
      'BEBIDA': 'tipo-bebida',
      'ENTRADA': 'tipo-entrada',
      'POSTRE': 'tipo-postre'
    };
    return classes[tipo] || 'tipo-plato';
  }

  getTipoIcon(tipo: string): string {
    const icons: any = {
      'PLATO': 'lunch_dining',
      'BEBIDA': 'local_cafe',
      'ENTRADA': 'tapas',
      'POSTRE': 'cake'
    };
    return icons[tipo] || 'restaurant';
  }

  nuevoProducto(): void {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarProductos();
      }
    });
  }

  editarProducto(producto: Producto): void {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '600px',
      disableClose: true,
      data: { producto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarProductos();
      }
    });
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productosService.eliminar(id.toString()).subscribe({
        next: () => {
          this.snackBar.open('Producto eliminado', 'Cerrar', { duration: 3000 });
          this.cargarProductos();
        },
        error: (error) => {
          this.snackBar.open('Error al eliminar producto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
