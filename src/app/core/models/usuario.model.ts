export interface Usuario {
  id: number;
  nombre_usuario: string;
  nombre_completo?: string;
  correo?: string;
  rol_id: number;
  activo: boolean;
  fecha_creacion?: string;
}

export type Rol = 'CAJERO' | 'MESERO' | 'ADMINISTRADOR' | 'COCINA' | 'BEBIDAS';

export interface LoginRequest {
  nombre_usuario: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: Usuario;
}

export interface RegisterRequest {
  nombre_usuario: string;
  nombre_completo?: string;
  correo?: string;
  password: string;
  rol_id?: number;
}
