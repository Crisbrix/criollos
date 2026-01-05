import { Usuario } from './usuario.model';
import { Producto } from './producto.model';

export interface Pedido {
  id: number;
  mesa_id: number;
  mesa_nombre?: string;
  estado: EstadoPedido;
  total: number;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  usuario_id: number;
  nombre_usuario?: string;
  nombre_completo?: string;
  detalles: DetallePedido[];
}

export type EstadoPedido = 'abierto' | 'enviado_cocina' | 'listo' | 'cerrado' | 'cancelado';

export interface DetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  producto_nombre?: string;
  notas?: string;
}

export interface PedidoCreate {
  mesa_id: number;
  productos: {
    producto_id: number;
    cantidad: number;
    notas?: string;
  }[];
  observaciones?: string;
}
