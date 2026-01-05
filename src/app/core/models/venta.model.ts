import { Usuario } from './usuario.model';
import { Producto } from './producto.model';
import { Pedido } from './pedido.model';

export interface Venta {
  id: number;
  usuario_id: number;
  pedido_id?: number;
  total: number;
  metodo_pago: MetodoPago;
  estado: EstadoVenta;
  observaciones?: string;
  fecha_creacion: string;
  nombre_usuario?: string;
  nombre_completo?: string;
  detalles: DetalleVenta[];
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';
export type EstadoVenta = 'completada' | 'cancelada' | 'pendiente';

export interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto_nombre?: string;
}

export interface VentaCreate {
  productos: {
    productoId: string;
    cantidad: number;
  }[];
  metodoPago?: MetodoPago;
  observaciones?: string;
}

export interface VentaDesdePedido {
  pedido_id: number;
  metodo_pago?: MetodoPago;
  observaciones?: string;
}
