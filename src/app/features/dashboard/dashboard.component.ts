import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  refreshInterval: any;
  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', roles: ['CAJERO', 'MESERO', 'ADMINISTRADOR', 'COCINA', 'BEBIDAS'] },
    { icon: 'inventory', label: 'Productos', route: '/productos', roles: ['ADMINISTRADOR', 'CAJERO'] },
    { icon: 'restaurant_menu', label: 'Pedidos', route: '/pedidos', roles: ['MESERO', 'ADMINISTRADOR', 'COCINA', 'BEBIDAS'] },
    { icon: 'table_restaurant', label: 'Mesas', route: '/mesas', roles: ['MESERO', 'ADMINISTRADOR', 'CAJERO'] },
    { icon: 'restaurant', label: 'Cocina', route: '/cocina', roles: ['COCINA', 'ADMINISTRADOR'] },
    { icon: 'point_of_sale', label: 'Ventas', route: '/ventas', roles: ['CAJERO', 'ADMINISTRADOR'] },
    { icon: 'people', label: 'Usuarios', route: '/usuarios', roles: ['ADMINISTRADOR'] },
    { icon: 'assessment', label: 'Reportes', route: '/reportes', roles: ['CAJERO', 'ADMINISTRADOR'] },
    { icon: 'settings', label: 'Configuración', route: '/configuracion', roles: ['ADMINISTRADOR'] }
  ];

  // Estadísticas del día
  stats = {
    ventasHoy: 0,
    pedidosActivos: 0,
    productosVendidos: 0,
    ingresoTotal: 0
  };

  // Datos para gráficas
  ventasHoraData: number[] = [];
  ventasHoraLabels: string[] = [];
  
  productosPopularesData: number[] = [];
  productosPopularesLabels: string[] = [];

  mesasEstado = {
    disponibles: 0,
    ocupadas: 0,
    reservadas: 0
  };

  pedidosRecientes: any[] = [];

  constructor(
    public authService: AuthService,
    public router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    // Actualizar datos cada 30 segundos
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 30000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    this.dashboardService.obtenerEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Estadísticas principales
          this.stats = data.stats;

          // Ventas por hora
          this.ventasHoraLabels = data.ventasPorHora.labels;
          this.ventasHoraData = data.ventasPorHora.data;

          // Productos más vendidos
          this.productosPopularesLabels = data.productosPopulares.map(p => p.nombre);
          this.productosPopularesData = data.productosPopulares.map(p => p.cantidad);

          // Estado de mesas
          this.mesasEstado = data.mesasEstado;

          // Pedidos recientes
          this.pedidosRecientes = data.pedidosRecientes;
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar datos del dashboard:', error);
          
          if (error.status === 401) {
            this.authService.logout();
            return;
          }
          
          this.stats = {
            ventasHoy: 0,
            pedidosActivos: 0,
            productosVendidos: 0,
            ingresoTotal: 0
          };
          this.isLoading = false;
        }
      });
  }

  canShowMenuItem(roles: string[]): boolean {
    // Por ahora, mostrar todos los items del menú
    // TODO: Implementar lógica de roles basada en rol_id
    return true;
  }

  getRoleName(rol_id?: number): string {
    const roles: any = {
      1: 'Administrador',
      2: 'Cajero',
      3: 'Mesero',
      4: 'Cocina',
      5: 'Bebidas'
    };
    return roles[rol_id || 1] || 'Usuario';
  }

  isExactDashboardRoute(): boolean {
    return this.router.url === '/dashboard';
  }

  hasChildRoute(): boolean {
    const url = this.router.url;
    return url !== '/dashboard' && url !== '/' && 
           (url.startsWith('/productos') || url.startsWith('/pedidos') || 
            url.startsWith('/mesas') || url.startsWith('/cocina') || 
            url.startsWith('/ventas') || url.startsWith('/reportes') || 
            url.startsWith('/configuracion') || url.startsWith('/usuarios'));
  }

  getMaxProducto(): number {
    if (this.productosPopularesData.length === 0) return 1;
    return Math.max(...this.productosPopularesData);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getEstadoClass(estado: string): string {
    const classes: any = {
      'preparando': 'estado-preparando',
      'en_proceso': 'estado-preparando',
      'listo': 'estado-listo',
      'entregado': 'estado-entregado',
      'cerrado': 'estado-entregado',
      'pendiente': 'estado-preparando'
    };
    return classes[estado?.toLowerCase()] || '';
  }

  getTotalMesas(): number {
    return this.mesasEstado.disponibles + this.mesasEstado.ocupadas + this.mesasEstado.reservadas;
  }

  getMaxVenta(): number {
    if (this.ventasHoraData.length === 0) return 1;
    return Math.max(...this.ventasHoraData);
  }

  getPercentajeMesa(cantidad: number): number {
    const total = this.getTotalMesas();
    return total === 0 ? 0 : (cantidad / total) * 100;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getLinePoints(): string {
    if (this.ventasHoraData.length === 0) return '';
    const maxVenta = this.getMaxVenta();
    const points = this.ventasHoraData.map((value, index) => {
      const x = 40 + (index * 65);
      const y = 200 - (maxVenta > 0 ? (value / maxVenta) * 170 : 0);
      return `${x},${y}`;
    });
    return points.join(' ');
  }

  getAreaPoints(): string {
    if (this.ventasHoraData.length === 0) return '';
    const maxVenta = this.getMaxVenta();
    const points = this.ventasHoraData.map((value, index) => {
      const x = 40 + (index * 65);
      const y = 200 - (maxVenta > 0 ? (value / maxVenta) * 170 : 0);
      return `${x},${y}`;
    });
    
    // Agregar puntos base para cerrar el polígono
    const lastX = 40 + ((this.ventasHoraData.length - 1) * 65);
    points.push(`${lastX},200`);
    points.push(`40,200`);
    
    return points.join(' ');
  }

  getPieDasharray(tipo: string): string {
    const total = this.getTotalMesas();
    if (total === 0) return '0 502.65';
    
    let cantidad = 0;
    if (tipo === 'disponible') cantidad = this.mesasEstado.disponibles;
    else if (tipo === 'ocupada') cantidad = this.mesasEstado.ocupadas;
    else if (tipo === 'reservada') cantidad = this.mesasEstado.reservadas;
    
    const circumference = 502.65; // 2 * PI * 80
    const dashLength = (cantidad / total) * circumference;
    return `${dashLength} ${circumference}`;
  }

  getPieDashoffset(tipo: string): string {
    const total = this.getTotalMesas();
    if (total === 0) return '0';
    
    const circumference = 502.65;
    let offset = 0;
    
    // Disponibles comienza en 0
    if (tipo === 'ocupada') {
      offset = (this.mesasEstado.disponibles / total) * circumference;
    } else if (tipo === 'reservada') {
      offset = ((this.mesasEstado.disponibles + this.mesasEstado.ocupadas) / total) * circumference;
    }
    
    return `${offset}`;
  }
}
