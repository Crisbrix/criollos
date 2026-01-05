import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Debug: Log para verificar si el interceptor se ejecuta
  console.log('🔍 Auth Interceptor - Token:', token ? 'Presente' : 'No presente');
  console.log('🔍 Auth Interceptor - URL:', req.url);

  // No agregar token para rutas de autenticación
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    console.log('🔓 Auth Interceptor - Ruta de autenticación, sin token');
    return next(req);
  }

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('🔍 Auth Interceptor - Header Authorization agregado');
    return next(clonedRequest);
  }

  console.log('⚠️ Auth Interceptor - No se agregó token');
  return next(req);
};
