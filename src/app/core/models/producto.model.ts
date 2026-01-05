export interface Producto {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  costo?: number;
  stock: number;
  unidad?: string;
  fecha_creacion?: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock?: number;
  categoria?: string;
  unidad?: string;
  activo?: boolean;
}
