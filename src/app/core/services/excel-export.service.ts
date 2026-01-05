import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  exportarReporteCompleto(data: any): void {
    const workbook = XLSX.utils.book_new();
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // ==================== HOJA 1: PORTADA Y RESUMEN EJECUTIVO ====================
    const portadaData = [
      [''],
      [''],
      ['RESTAURANTE CRIOLLO'],
      ['REPORTE EJECUTIVO DE VENTAS'],
      [''],
      [`Generado: ${fechaStr}`],
      [''],
      [''],
      ['═══════════════════════════════════════════════════════════════'],
      [''],
      ['INDICADORES CLAVE DE RENDIMIENTO (KPIs)'],
      [''],
      ['Métrica', 'Valor', 'Descripción'],
      ['Total de Ventas', data.estadisticas.totalVentas, 'Número de transacciones completadas'],
      ['Ingresos Totales', data.estadisticas.ingresoTotal, 'Suma total de ventas en pesos'],
      ['Ticket Promedio', data.estadisticas.ticketPromedio, 'Valor promedio por venta'],
      ['Productos Vendidos', data.estadisticas.productosVendidos, 'Unidades totales vendidas'],
      ['Top Producto', data.estadisticas.productosMasVendido, 'Producto más vendido del día'],
      [''],
      [''],
      ['DISTRIBUCIÓN DE MÉTODOS DE PAGO'],
      [''],
      ['Método', 'Porcentaje', 'Participación'],
      ['💵 Efectivo', `${data.metodosPago.efectivo}%`, this.getBarraProgreso(data.metodosPago.efectivo)],
      ['💳 Tarjeta', `${data.metodosPago.tarjeta}%`, this.getBarraProgreso(data.metodosPago.tarjeta)],
      ['🏦 Transferencia', `${data.metodosPago.transferencia}%`, this.getBarraProgreso(data.metodosPago.transferencia)],
      [''],
      [''],
      ['ANÁLISIS DE TENDENCIAS'],
      [''],
      ['Total Semana', data.ventasPorDia.reduce((a: number, b: number) => a + b, 0), 'Suma de ventas últimos 7 días'],
      ['Promedio Diario', (data.ventasPorDia.reduce((a: number, b: number) => a + b, 0) / 7).toFixed(2), 'Promedio de ventas por día'],
      ['Mejor Día', this.getMejorDia(data.ventasPorDia, data.diasSemana), 'Día con mayores ventas'],
    ];
    
    const wsPortada = XLSX.utils.aoa_to_sheet(portadaData);
    
    // Anchos de columna para portada
    wsPortada['!cols'] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 45 }
    ];
    
    // Combinar celdas para títulos
    wsPortada['!merges'] = [
      { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // RESTAURANTE CRIOLLO
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }, // REPORTE EJECUTIVO
      { s: { r: 5, c: 0 }, e: { r: 5, c: 2 } }, // Fecha
      { s: { r: 8, c: 0 }, e: { r: 8, c: 2 } }, // Línea separadora
      { s: { r: 10, c: 0 }, e: { r: 10, c: 2 } }, // KPIs
      { s: { r: 20, c: 0 }, e: { r: 20, c: 2 } }, // Métodos de pago
      { s: { r: 28, c: 0 }, e: { r: 28, c: 2 } }, // Análisis
    ];
    
    XLSX.utils.book_append_sheet(workbook, wsPortada, '📊 Resumen Ejecutivo');

    // ==================== HOJA 2: TOP PRODUCTOS ====================
    const topProductosData = [
      [''],
      ['TOP 5 PRODUCTOS MÁS VENDIDOS'],
      [''],
      ['#', 'Producto', 'Cantidad', 'Participación', 'Indicador'],
    ];
    
    data.topProductos.forEach((p: any, index: number) => {
      topProductosData.push([
        index + 1,
        p.nombre,
        p.cantidad,
        `${p.porcentaje}%`,
        this.getBarraProgreso(p.porcentaje)
      ]);
    });
    
    topProductosData.push(['']);
    topProductosData.push(['ANÁLISIS']);
    topProductosData.push(['Total Unidades:', data.topProductos.reduce((sum: number, p: any) => sum + p.cantidad, 0)]);
    topProductosData.push(['Producto Líder:', data.topProductos[0]?.nombre || 'N/A']);
    topProductosData.push(['Diferencia 1° vs 2°:', data.topProductos[0] && data.topProductos[1] ? `${data.topProductos[0].cantidad - data.topProductos[1].cantidad} unidades` : 'N/A']);
    
    const wsTopProductos = XLSX.utils.aoa_to_sheet(topProductosData);
    wsTopProductos['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 12 },
      { wch: 15 },
      { wch: 30 }
    ];
    
    wsTopProductos['!merges'] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }
    ];
    
    XLSX.utils.book_append_sheet(workbook, wsTopProductos, '🏆 Top Productos');

    // ==================== HOJA 3: VENTAS POR DÍA ====================
    const ventasDiaData = [
      [''],
      ['ANÁLISIS DE VENTAS POR DÍA DE LA SEMANA'],
      [''],
      ['Día', 'Ventas ($)', 'Variación', 'Rendimiento'],
    ];
    
    const promedioDiario = data.ventasPorDia.reduce((a: number, b: number) => a + b, 0) / 7;
    
    data.diasSemana.forEach((dia: string, index: number) => {
      const venta = data.ventasPorDia[index];
      const variacion = ((venta - promedioDiario) / promedioDiario * 100).toFixed(1);
      const indicador = venta > promedioDiario ? '📈 Sobre promedio' : venta < promedioDiario ? '📉 Bajo promedio' : '➡️ En promedio';
      
      ventasDiaData.push([
        dia,
        venta,
        `${variacion}%`,
        indicador
      ]);
    });
    
    ventasDiaData.push(['']);
    ventasDiaData.push(['ESTADÍSTICAS']);
    ventasDiaData.push(['Total Semana:', data.ventasPorDia.reduce((a: number, b: number) => a + b, 0)]);
    ventasDiaData.push(['Promedio Diario:', promedioDiario.toFixed(2)]);
    ventasDiaData.push(['Día Más Alto:', this.getMejorDia(data.ventasPorDia, data.diasSemana)]);
    ventasDiaData.push(['Día Más Bajo:', this.getPeorDia(data.ventasPorDia, data.diasSemana)]);
    
    const wsVentasDia = XLSX.utils.aoa_to_sheet(ventasDiaData);
    wsVentasDia['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 }
    ];
    
    wsVentasDia['!merges'] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }
    ];
    
    XLSX.utils.book_append_sheet(workbook, wsVentasDia, '📅 Ventas por Día');

    // ==================== HOJA 4: INVENTARIO Y PRODUCTOS ====================
    if (data.productos && data.productos.length > 0) {
      const inventarioData = [
        [''],
        ['INVENTARIO Y ANÁLISIS DE PRODUCTOS'],
        [''],
        ['ID', 'Producto', 'Categoría', 'Precio Venta', 'Costo', 'Margen %', 'Stock', 'Valor Inventario', 'Estado'],
      ];
      
      let totalInventario = 0;
      let totalCosto = 0;
      
      data.productos.forEach((p: any) => {
        const costo = p.costo || 0;
        const margen = costo > 0 ? (((p.precio - costo) / p.precio) * 100).toFixed(1) : 'N/A';
        const valorInventario = p.precio * p.stock;
        const estado = p.stock < 10 ? '⚠️ Bajo' : p.stock < 20 ? '⚡ Medio' : '✅ Bueno';
        
        totalInventario += valorInventario;
        totalCosto += costo * p.stock;
        
        inventarioData.push([
          p.id,
          p.nombre,
          p.categoria || 'General',
          p.precio,
          costo,
          margen,
          p.stock,
          valorInventario,
          estado
        ]);
      });
      
      inventarioData.push(['']);
      inventarioData.push(['RESUMEN FINANCIERO']);
      inventarioData.push(['Total Productos:', data.productos.length.toString()]);
      inventarioData.push(['Valor Total Inventario:', totalInventario.toFixed(2)]);
      inventarioData.push(['Costo Total Inventario:', totalCosto.toFixed(2)]);
      inventarioData.push(['Ganancia Potencial:', (totalInventario - totalCosto).toFixed(2)]);
      inventarioData.push(['Margen Promedio:', `${((totalInventario - totalCosto) / totalInventario * 100).toFixed(1)}%`]);
      
      const wsInventario = XLSX.utils.aoa_to_sheet(inventarioData);
      wsInventario['!cols'] = [
        { wch: 8 },
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 8 },
        { wch: 15 },
        { wch: 12 }
      ];
      
      wsInventario['!merges'] = [
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }
      ];
      
      XLSX.utils.book_append_sheet(workbook, wsInventario, '📦 Inventario');
    }

    // Generar archivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fechaArchivo = new Date().toISOString().split('T')[0];
    saveAs(blob, `Reporte_Ejecutivo_CriolloS_${fechaArchivo}.xlsx`);
  }

  private getBarraProgreso(porcentaje: number): string {
    const barras = Math.round(porcentaje / 10);
    return '█'.repeat(barras) + '░'.repeat(10 - barras) + ` ${porcentaje}%`;
  }

  private getMejorDia(ventas: number[], dias: string[]): string {
    const maxVenta = Math.max(...ventas);
    const index = ventas.indexOf(maxVenta);
    return `${dias[index]} ($${maxVenta.toLocaleString()})`;
  }

  private getPeorDia(ventas: number[], dias: string[]): string {
    const minVenta = Math.min(...ventas);
    const index = ventas.indexOf(minVenta);
    return `${dias[index]} ($${minVenta.toLocaleString()})`;
  }

  exportarProductos(productos: any[]): void {
    const headers = [['ID', 'Nombre', 'Categoría', 'Precio', 'Costo', 'Stock', 'Margen']];
    const data = productos.map(p => [
      p.id,
      p.nombre,
      p.categoria || 'N/A',
      p.precio,
      p.costo || 0,
      p.stock,
      p.costo ? `${(((p.precio - p.costo) / p.precio) * 100).toFixed(2)}%` : 'N/A'
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fecha = new Date().toISOString().split('T')[0];
    saveAs(blob, `Productos_${fecha}.xlsx`);
  }

  exportarVentas(ventas: any[]): void {
    const headers = [['ID', 'Fecha', 'Mesa', 'Total', 'Método Pago', 'Estado', 'Usuario']];
    const data = ventas.map(v => [
      v.id,
      new Date(v.fecha_creacion).toLocaleString(),
      v.mesa_nombre || `Mesa ${v.mesa_id}`,
      `$${v.total.toLocaleString()}`,
      v.metodo_pago,
      v.estado,
      v.nombre_usuario
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fecha = new Date().toISOString().split('T')[0];
    saveAs(blob, `Ventas_${fecha}.xlsx`);
  }
}
