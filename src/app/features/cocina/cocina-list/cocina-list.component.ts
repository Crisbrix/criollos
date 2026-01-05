import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PedidosService } from '../../../core/services/pedidos.service';

@Component({
  selector: 'app-cocina-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './cocina-list.component.html',
  styleUrl: './cocina-list.component.scss'
})
export class CocinaListComponent implements OnInit {
  pedidos: any[] = [];
  loading = false;
  private pollingInterval: any;

  constructor(
    private pedidosService: PedidosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarPedidosInicial();
    // Polling silencioso cada 5 segundos (sin mostrar loading)
    this.pollingInterval = setInterval(() => {
      this.actualizarPedidosSilencioso();
    }, 5000);
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
        // Filtrar solo pedidos activos (abierto o enviado_cocina)
        this.pedidos = response.pedidos.filter(p => 
          p.estado === 'abierto' || p.estado === 'enviado_cocina'
        );
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
        const pedidosActivos = response.pedidos.filter(p => 
          p.estado === 'abierto' || p.estado === 'enviado_cocina'
        );

        // Agregar nuevos pedidos que no estén en la lista
        pedidosActivos.forEach(pedidoNuevo => {
          const existe = this.pedidos.find(p => p.id === pedidoNuevo.id);
          if (!existe) {
            this.pedidos.unshift(pedidoNuevo); // Agregar al inicio
          } else {
            // Actualizar estado si cambió
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

  cambiarEstado(pedido: any, nuevoEstado: 'abierto' | 'enviado_cocina' | 'listo' | 'cerrado' | 'cancelado'): void {
    this.pedidosService.cambiarEstado(pedido.id.toString(), nuevoEstado).subscribe({
      next: () => {
        const mensaje = nuevoEstado === 'listo' ? 'Pedido listo para entregar' : 'Estado actualizado';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 2000 });
        // Actualizar silenciosamente sin mostrar loading
        this.actualizarPedidosSilencioso();
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.snackBar.open('Error al actualizar estado', 'Cerrar', { duration: 3000 });
      }
    });
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

  getEstadoClass(estado: string): string {
    const classes: any = {
      'abierto': 'estado-nuevo',
      'enviado_cocina': 'estado-preparando',
      'cerrado': 'estado-listo'
    };
    return classes[estado] || 'estado-nuevo';
  }

  getEstadoLabel(estado: string): string {
    const labels: any = {
      'abierto': 'Nuevo',
      'enviado_cocina': 'En Preparación',
      'cerrado': 'Listo'
    };
    return labels[estado] || estado;
  }

  getPedidosNuevos(): number {
    return this.pedidos.filter(p => p.estado === 'abierto').length;
  }

  getPedidosPreparando(): number {
    return this.pedidos.filter(p => p.estado === 'enviado_cocina').length;
  }
}
