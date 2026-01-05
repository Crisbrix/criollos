import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReportesService } from '../../core/services/reportes.service';
import { ExcelExportService } from '../../core/services/excel-export.service';
import { ProductosService } from '../../core/services/productos.service';
import { ReporteDetalleModalComponent } from './reporte-detalle-modal/reporte-detalle-modal.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent implements OnInit {
  periodo: string = 'SEMANA';

  estadisticas = {
    totalVentas: 0,
    ingresoTotal: 0,
    ticketPromedio: 0,
    productosVendidos: 0,
    productosMasVendido: ''
  };

  ventasPorDia: number[] = [];
  diasSemana: string[] = [];

  metodosPago = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0
  };

  getMetodosPagoAllZero(): boolean {
    return (this.metodosPago.efectivo || 0) === 0
      && (this.metodosPago.tarjeta || 0) === 0
      && (this.metodosPago.transferencia || 0) === 0;
  }

  getDonutBackground(): string {
    const efectivo = Math.max(0, Math.min(100, Number(this.metodosPago.efectivo) || 0));
    const tarjeta = Math.max(0, Math.min(100, Number(this.metodosPago.tarjeta) || 0));
    const transferencia = Math.max(0, Math.min(100, Number(this.metodosPago.transferencia) || 0));

    if (this.getMetodosPagoAllZero()) {
      return 'conic-gradient(#ef4444 0% 100%)';
    }

    const eEnd = efectivo;
    const tEnd = efectivo + tarjeta;

    return `conic-gradient(
      #2196f3 0% ${eEnd}%,
      #9c27b0 ${eEnd}% ${tEnd}%,
      #ff9800 ${tEnd}% 100%
    )`;
  }

  topProductos: any[] = [];

  reportes = [
    {
      titulo: 'Ventas Diarias',
      descripcion: 'Reporte detallado de ventas del día',
      icono: 'today',
      ruta: '/api/reportes/ventas-diarias',
      clase: 'icon-ventas'
    },
    {
      titulo: 'Cierre de Caja',
      descripcion: 'Resumen de ventas por método de pago',
      icono: 'account_balance',
      ruta: '/api/reportes/cierre-caja',
      clase: 'icon-caja'
    },
    {
      titulo: 'Productos Vendidos',
      descripcion: 'Productos más vendidos del período',
      icono: 'trending_up',
      ruta: '/api/reportes/productos-vendidos',
      clase: 'icon-productos'
    },
    {
      titulo: 'Estado de Inventario',
      descripcion: 'Stock actual y productos con stock bajo',
      icono: 'inventory',
      ruta: '/api/reportes/inventario',
      clase: 'icon-inventario'
    },
    {
      titulo: 'Reporte Mensual',
      descripcion: 'Análisis completo del mes',
      icono: 'calendar_month',
      ruta: '/api/reportes/mensual',
      clase: 'icon-mensual'
    },
    {
      titulo: 'Análisis de Clientes',
      descripcion: 'Comportamiento y preferencias',
      icono: 'people',
      ruta: '/api/reportes/clientes',
      clase: 'icon-clientes'
    }
  ];

  constructor(
    private snackBar: MatSnackBar,
    private reportesService: ReportesService,
    private excelService: ExcelExportService,
    private productosService: ProductosService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar ventas diarias
    this.reportesService.ventasDiarias().subscribe({
      next: (data) => {
        console.log('Datos de ventas:', data);
        
        this.estadisticas.totalVentas = data.resumen.cantidadVentas || 0;
        this.estadisticas.ingresoTotal = data.resumen.totalVentas || 0;
        this.estadisticas.ticketPromedio = data.resumen.ticketPromedio || 0;

        // Calcular métodos de pago
        const total = data.resumen.totalVentas || 0;
        if (data.porMetodoPago && total > 0) {
          const efectivo = data.porMetodoPago['EFECTIVO']?.total || 0;
          const tarjeta = data.porMetodoPago['TARJETA']?.total || 0;
          const transferencia = data.porMetodoPago['TRANSFERENCIA']?.total || 0;
          
          this.metodosPago = {
            efectivo: Math.round((efectivo / total) * 100),
            tarjeta: Math.round((tarjeta / total) * 100),
            transferencia: Math.round((transferencia / total) * 100)
          };
        } else {
          this.metodosPago = {
            efectivo: 0,
            tarjeta: 0,
            transferencia: 0
          };
        }
      },
      error: (error) => {
        console.error('Error al cargar ventas diarias:', error);
        this.snackBar.open('Error al cargar datos de ventas', 'Cerrar', { duration: 3000 });
      }
    });

    // Cargar productos más vendidos
    this.reportesService.productosVendidos(undefined, undefined, 5).subscribe({
      next: (data) => {
        console.log('Productos vendidos:', data);
        
        this.topProductos = data.productos.map((p: any) => ({
          nombre: p.producto.nombre,
          cantidad: p.cantidadVendida,
          porcentaje: 0
        }));

        // Calcular porcentajes
        const maxCantidad = Math.max(...this.topProductos.map(p => p.cantidad), 1);
        this.topProductos = this.topProductos.map(p => ({
          ...p,
          porcentaje: Math.round((p.cantidad / maxCantidad) * 100)
        }));

        if (this.topProductos.length > 0) {
          this.estadisticas.productosMasVendido = this.topProductos[0].nombre;
          this.estadisticas.productosVendidos = this.topProductos.reduce((sum, p) => sum + p.cantidad, 0);
        } else {
          this.estadisticas.productosMasVendido = 'N/A';
          this.estadisticas.productosVendidos = 0;
        }
      },
      error: (error) => {
        console.error('Error al cargar productos vendidos:', error);
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
      }
    });

    // Cargar ventas por día de la semana
    this.reportesService.ventasPorDia().subscribe({
      next: (data) => {
        console.log('Ventas por día:', data);
        this.ventasPorDia = data.ventasPorDia || [];
        this.diasSemana = data.labels || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      },
      error: (error) => {
        console.error('Error al cargar ventas por día:', error);
        // Valores por defecto en caso de error
        this.diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        this.ventasPorDia = [0, 0, 0, 0, 0, 0, 0];
      }
    });
  }

  cambiarPeriodo(periodo: string): void {
    this.periodo = periodo;
    this.cargarDatos();
    this.snackBar.open(`Mostrando datos de: ${this.getPeriodoTexto()}`, 'Cerrar', { duration: 2000 });
  }

  getPeriodoTexto(): string {
    const textos: any = {
      'HOY': 'Hoy',
      'SEMANA': 'Esta Semana',
      'MES': 'Este Mes',
      'ANIO': 'Este Año'
    };
    return textos[this.periodo] || 'Período';
  }

  getMaxVentas(): number {
    return Math.max(...this.ventasPorDia);
  }

  exportarTodo(): void {
    this.snackBar.open('📊 Generando reporte completo en Excel...', 'Cerrar', { duration: 2000 });

    // Cargar productos para incluir en el reporte
    this.productosService.listar().subscribe({
      next: (productosResponse) => {
        const datosCompletos = {
          estadisticas: this.estadisticas,
          metodosPago: this.metodosPago,
          topProductos: this.topProductos,
          ventasPorDia: this.ventasPorDia,
          diasSemana: this.diasSemana,
          productos: productosResponse.productos
        };

        this.excelService.exportarReporteCompleto(datosCompletos);
        this.snackBar.open('✅ Reporte exportado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        // Exportar sin productos si falla
        const datosCompletos = {
          estadisticas: this.estadisticas,
          metodosPago: this.metodosPago,
          topProductos: this.topProductos,
          ventasPorDia: this.ventasPorDia,
          diasSemana: this.diasSemana,
          productos: []
        };

        this.excelService.exportarReporteCompleto(datosCompletos);
        this.snackBar.open('✅ Reporte exportado (sin lista de productos)', 'Cerrar', { duration: 3000 });
      }
    });
  }

  generarReporte(ruta: string): void {
    const tipo = this.getTipoReporte(ruta);
    
    this.snackBar.open('📊 Cargando datos del reporte...', 'Cerrar', { duration: 1000 });

    // Cargar datos según el tipo de reporte
    switch (tipo) {
      case 'ventas-diarias':
        this.reportesService.ventasDiarias().subscribe({
          next: (data) => this.abrirModal('Ventas Diarias', tipo, data),
          error: (error) => this.mostrarError(error)
        });
        break;

      case 'productos-vendidos':
        this.reportesService.productosVendidos().subscribe({
          next: (data) => this.abrirModal('Productos Más Vendidos', tipo, data),
          error: (error) => this.mostrarError(error)
        });
        break;

      case 'cierre-caja':
        this.reportesService.cierreCaja().subscribe({
          next: (data) => this.abrirModal('Cierre de Caja', tipo, data),
          error: (error) => this.mostrarError(error)
        });
        break;

      case 'inventario':
        this.reportesService.inventario().subscribe({
          next: (data) => this.abrirModal('Estado de Inventario', tipo, data),
          error: (error) => this.mostrarError(error)
        });
        break;

      default:
        this.snackBar.open('Reporte no disponible', 'Cerrar', { duration: 2000 });
    }
  }

  private getTipoReporte(ruta: string): string {
    if (ruta.includes('ventas-diarias')) return 'ventas-diarias';
    if (ruta.includes('productos-vendidos')) return 'productos-vendidos';
    if (ruta.includes('cierre-caja')) return 'cierre-caja';
    if (ruta.includes('inventario')) return 'inventario';
    return '';
  }

  private abrirModal(titulo: string, tipo: string, datos: any): void {
    this.dialog.open(ReporteDetalleModalComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: {
        titulo,
        tipo,
        datos
      }
    });
  }

  private mostrarError(error: any): void {
    console.error('Error al cargar reporte:', error);
    this.snackBar.open('❌ Error al cargar el reporte', 'Cerrar', { duration: 3000 });
  }
}
