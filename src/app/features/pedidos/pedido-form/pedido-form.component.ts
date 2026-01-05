import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PedidosService } from '../../../core/services/pedidos.service';
import { ProductosService } from '../../../core/services/productos.service';
import { MesasService } from '../../../core/services/mesas.service';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './pedido-form.component.html',
  styleUrl: './pedido-form.component.scss'
})
export class PedidoFormComponent implements OnInit {
  mesa_id: number = 0;
  observaciones: string = '';
  productos: any[] = [];
  productosDisponibles: any[] = [];
  productosSeleccionados: any[] = [];
  mesasDisponibles: any[] = [];
  loading = false;
  loadingMesas = true; // Indicador de carga de mesas
  paso: number = 1; // 1: Seleccionar mesa, 2: Seleccionar productos
  
  // Modo: 'nuevo' o 'adicionar'
  modo: string = 'nuevo';
  pedidoExistente: any = null;
  pedidosActivos: any[] = []; // Lista de pedidos activos para selector

  constructor(
    public dialogRef: MatDialogRef<PedidoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pedidosService: PedidosService,
    private productosService: ProductosService,
    private mesasService: MesasService,
    private snackBar: MatSnackBar
  ) {
    if (data) {
      this.modo = data.modo || 'nuevo';
      this.pedidoExistente = data.pedido || null;
      this.pedidosActivos = data.pedidosActivos || [];
      
      if (this.modo === 'adicionar' && this.pedidoExistente) {
        // Adicionar a un pedido específico
        this.mesa_id = this.pedidoExistente.mesa_id;
        this.paso = 2; // Ir directo a seleccionar productos
      } else if (this.modo === 'adicionar' && this.pedidosActivos.length > 0) {
        // Mostrar selector de mesas ocupadas
        this.paso = 1;
      }
    }
  }

  ngOnInit(): void {
    this.cargarMesas();
    this.cargarProductos();
  }

  cargarMesas(): void {
    this.loadingMesas = true;
    
    if (this.modo === 'adicionar' && this.pedidosActivos.length > 0) {
      // En modo adicionar, mostrar mesas con pedidos activos
      this.mesasDisponibles = this.pedidosActivos.map(p => ({
        id: p.mesa_id,
        nombre: p.mesa_nombre || `Mesa ${p.mesa_id}`,
        numero: p.mesa_id,
        estado: 'ocupada',
        pedido: p
      }));
      this.loadingMesas = false;
    } else {
      // En modo nuevo, cargar todas las mesas y filtrar las que NO tienen pedidos activos
      this.mesasService.listar().subscribe({
        next: (response) => {
          // Obtener IDs de mesas con pedidos activos
          this.pedidosService.listar().subscribe({
            next: (pedidosResponse) => {
              const mesasOcupadas = pedidosResponse.pedidos
                .filter(p => p.estado !== 'cerrado' && p.estado !== 'cancelado')
                .map(p => p.mesa_id);
              
              // Filtrar mesas que estén libres Y no tengan pedidos activos
              this.mesasDisponibles = response.mesas.filter(m => 
                m.estado === 'libre' && !mesasOcupadas.includes(m.id)
              );
              
              this.loadingMesas = false;
              
              if (this.mesasDisponibles.length === 0) {
                this.snackBar.open('No hay mesas libres disponibles', 'Cerrar', { duration: 3000 });
              }
            },
            error: (error) => {
              console.error('Error al verificar pedidos:', error);
              // Si falla, mostrar todas las mesas libres
              this.mesasDisponibles = response.mesas.filter(m => m.estado === 'libre');
              this.loadingMesas = false;
            }
          });
        },
        error: (error) => {
          console.error('Error al cargar mesas:', error);
          this.loadingMesas = false;
          this.snackBar.open('Error al cargar mesas', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  cargarProductos(): void {
    this.productosService.listar().subscribe({
      next: (response) => {
        this.productosDisponibles = response.productos;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  seleccionarMesa(mesa: any): void {
    this.mesa_id = mesa.id;
    
    // Si es modo adicionar y la mesa tiene un pedido asociado
    if (this.modo === 'adicionar' && mesa.pedido) {
      this.pedidoExistente = mesa.pedido;
      console.log('Pedido seleccionado para adicionar:', this.pedidoExistente);
    }
    
    this.paso = 2;
  }

  volverAMesas(): void {
    this.paso = 1;
  }

  agregarProducto(producto: any): void {
    // Verificar stock disponible
    if (producto.stock <= 0) {
      this.snackBar.open('Producto sin stock disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    const existe = this.productosSeleccionados.find(p => p.producto_id === producto.id);
    
    if (existe) {
      // Verificar que no exceda el stock
      if (existe.cantidad >= producto.stock) {
        this.snackBar.open(`Stock máximo disponible: ${producto.stock}`, 'Cerrar', { duration: 3000 });
        return;
      }
      existe.cantidad++;
    } else {
      this.productosSeleccionados.push({
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        stock: producto.stock,
        notas: ''
      });
    }
  }

  eliminarProducto(index: number): void {
    this.productosSeleccionados.splice(index, 1);
  }

  cambiarCantidad(producto: any, cambio: number): void {
    const nuevaCantidad = producto.cantidad + cambio;
    
    if (nuevaCantidad < 1) {
      producto.cantidad = 1;
      return;
    }
    
    // Verificar stock disponible
    if (nuevaCantidad > producto.stock) {
      this.snackBar.open(`Stock máximo disponible: ${producto.stock}`, 'Cerrar', { duration: 3000 });
      return;
    }
    
    producto.cantidad = nuevaCantidad;
  }

  calcularTotal(): number {
    return this.productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  }

  guardar(): void {
    if (this.productosSeleccionados.length === 0) {
      this.snackBar.open('Debe agregar al menos un producto', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;

    if (this.modo === 'adicionar' && this.pedidoExistente) {
      // Adicionar productos al pedido existente
      this.adicionarProductos();
    } else {
      // Crear nuevo pedido
      this.crearNuevoPedido();
    }
  }

  crearNuevoPedido(): void {
    const pedidoData = {
      mesa_id: this.mesa_id,
      observaciones: this.observaciones,
      productos: this.productosSeleccionados.map(p => ({
        producto_id: p.producto_id,
        cantidad: p.cantidad,
        notas: p.notas
      }))
    };

    this.pedidosService.crear(pedidoData).subscribe({
      next: (response) => {
        this.snackBar.open('✅ Pedido creado exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al crear pedido:', error);
        const mensaje = error.error?.error || 'Error al crear pedido';
        this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  adicionarProductos(): void {
    console.log('=== DEBUG ADICIONAR ===');
    console.log('Modo:', this.modo);
    console.log('Pedido existente:', this.pedidoExistente);
    console.log('Mesa ID:', this.mesa_id);
    console.log('Productos seleccionados:', this.productosSeleccionados);

    if (!this.pedidoExistente || !this.pedidoExistente.id) {
      const errorMsg = `No se ha seleccionado un pedido válido. PedidoExistente: ${JSON.stringify(this.pedidoExistente)}`;
      console.error(errorMsg);
      this.snackBar.open('❌ Error: No se ha seleccionado un pedido válido', 'Cerrar', { duration: 5000 });
      this.loading = false;
      return;
    }

    const adicionData = {
      productos: this.productosSeleccionados.map(p => ({
        producto_id: p.producto_id,
        cantidad: p.cantidad,
        notas: p.notas || ''
      }))
    };

    console.log('Enviando al backend - Pedido ID:', this.pedidoExistente.id);
    console.log('Datos a enviar:', adicionData);

    this.pedidosService.adicionarProductos(this.pedidoExistente.id.toString(), adicionData).subscribe({
      next: (response) => {
        console.log('Respuesta exitosa:', response);
        this.snackBar.open('✅ Productos adicionados al pedido', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error('=== ERROR COMPLETO ===');
        console.error('Error object:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error error:', error.error);
        
        const mensaje = error.error?.error || error.message || 'Error al adicionar productos';
        this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', { duration: 5000 });
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
