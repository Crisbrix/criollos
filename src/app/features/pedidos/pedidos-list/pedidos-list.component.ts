import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PedidosService } from '../../../core/services/pedidos.service';
import { Pedido, EstadoPedido } from '../../../core/models/pedido.model';
import { PedidoFormComponent } from '../pedido-form/pedido-form.component';

@Component({
  selector: 'app-pedidos-list',
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
  templateUrl: './pedidos-list.component.html',
  styleUrl: './pedidos-list.component.scss'
})
export class PedidosListComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = false;
  private pollingInterval: any;

  constructor(
    private pedidosService: PedidosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarPedidosInicial();
    // Polling silencioso cada 10 segundos (sin mostrar loading)
    this.pollingInterval = setInterval(() => {
      this.actualizarPedidosSilencioso();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  cargarPedidosInicial(): void {
    this.loading = true;
    this.pedidosService.listar().subscribe({
      next: (response) => {
        console.log('Pedidos recibidos:', response.pedidos);
        this.pedidos = response.pedidos.filter(p => p.estado !== 'cerrado' && p.estado !== 'cancelado');
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al cargar pedidos:', error);
        this.snackBar.open('Error al cargar pedidos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  actualizarPedidosSilencioso(): void {
    this.pedidosService.listar().subscribe({
      next: (response) => {
        const pedidosActivos = response.pedidos.filter(p => p.estado !== 'cerrado' && p.estado !== 'cancelado');

        // Agregar nuevos pedidos que no estén en la lista
        pedidosActivos.forEach(pedidoNuevo => {
          const existe = this.pedidos.find(p => p.id === pedidoNuevo.id);
          if (!existe) {
            this.pedidos.unshift(pedidoNuevo); // Agregar al inicio
          } else {
            // Actualizar si cambió
            const index = this.pedidos.findIndex(p => p.id === pedidoNuevo.id);
            if (index !== -1) {
              this.pedidos[index] = pedidoNuevo;
            }
          }
        });

        // Remover pedidos que ya no están activos
        this.pedidos = this.pedidos.filter(p => 
          pedidosActivos.some(pa => pa.id === p.id)
        );
      },
      error: (error) => {
        console.error('Error al actualizar pedidos:', error);
      }
    });
  }

  cargarPedidos(): void {
    this.cargarPedidosInicial();
  }

  getPedidosPorEstado(estado: EstadoPedido): Pedido[] {
    return this.pedidos.filter(p => p.estado === estado);
  }

  getTiempoTranscurrido(fecha: Date | string): string {
    const ahora = new Date();
    const creado = new Date(fecha);
    const diff = Math.floor((ahora.getTime() - creado.getTime()) / 60000); // minutos
    
    if (diff < 1) return 'Ahora';
    if (diff === 1) return '1 min';
    if (diff < 60) return `${diff} min`;
    
    const horas = Math.floor(diff / 60);
    if (horas === 1) return '1 hora';
    return `${horas} horas`;
  }

  cambiarEstado(id: number | string, estado: EstadoPedido): void {
    const idString = typeof id === 'number' ? id.toString() : id;
    this.pedidosService.cambiarEstado(idString, estado).subscribe({
      next: () => {
        this.snackBar.open('Estado actualizado correctamente', 'Cerrar', { duration: 2000 });
        // Actualizar silenciosamente sin mostrar loading
        this.actualizarPedidosSilencioso();
      },
      error: (error) => {
        this.snackBar.open('Error al actualizar estado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  nuevoPedido(): void {
    const dialogRef = this.dialog.open(PedidoFormComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      data: { modo: 'nuevo' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarPedidos();
      }
    });
  }

  adicionarPedido(pedido?: Pedido): void {
    // Si no se pasa un pedido, mostrar selector de mesas con pedidos activos
    if (!pedido) {
      const pedidosActivos = this.pedidos.filter(p => 
        p.estado === 'abierto' || p.estado === 'enviado_cocina' || p.estado === 'listo'
      );

      if (pedidosActivos.length === 0) {
        this.snackBar.open('No hay mesas con pedidos activos para adicionar', 'Cerrar', { duration: 3000 });
        return;
      }

      // Abrir formulario con modo selector de mesas ocupadas
      const dialogRef = this.dialog.open(PedidoFormComponent, {
        width: '800px',
        maxWidth: '95vw',
        disableClose: false,
        data: { 
          modo: 'adicionar',
          pedidosActivos: pedidosActivos
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.cargarPedidos();
        }
      });
      return;
    }

    // Abrir formulario de adición para pedido específico
    const dialogRef = this.dialog.open(PedidoFormComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      data: { 
        modo: 'adicionar',
        pedido: pedido
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarPedidos();
      }
    });
  }
}
