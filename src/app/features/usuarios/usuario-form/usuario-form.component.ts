import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss'
})
export class UsuarioFormComponent implements OnInit {
  nombre_usuario = '';
  nombre_completo = '';
  correo = '';
  password = '';
  rol_id = 3; // Mesero por defecto
  loading = false;
  hidePassword = true;
  isEditMode = false;
  usuarioId: number | null = null;

  roles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Cajero' },
    { id: 3, nombre: 'Mesero' },
    { id: 4, nombre: 'Cocina' },
    { id: 5, nombre: 'Bebidas' }
  ];

  constructor(
    public dialogRef: MatDialogRef<UsuarioFormComponent>,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data?.usuario) {
      this.isEditMode = true;
      this.usuarioId = this.data.usuario.id;
      this.nombre_usuario = this.data.usuario.nombre_usuario;
      this.nombre_completo = this.data.usuario.nombre_completo;
      this.correo = this.data.usuario.correo || '';
      this.rol_id = this.data.usuario.rol_id;
    }
  }

  guardarUsuario(): void {
    if (this.isEditMode) {
      this.editarUsuario();
    } else {
      this.crearUsuario();
    }
  }

  crearUsuario(): void {
    if (!this.nombre_usuario || !this.password) {
      this.snackBar.open('Nombre de usuario y contraseña son requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.password.length < 6) {
      this.snackBar.open('La contraseña debe tener al menos 6 caracteres', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;

    const userData = {
      nombre_usuario: this.nombre_usuario,
      nombre_completo: this.nombre_completo || this.nombre_usuario,
      correo: this.correo || null,
      password: this.password,
      rol_id: this.rol_id
    };

    this.http.post(`${environment.apiUrl}/auth/register`, userData).subscribe({
      next: (response) => {
        this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al crear usuario:', error);
        const mensaje = error.error?.error || 'Error al crear usuario';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
      }
    });
  }

  editarUsuario(): void {
    if (!this.nombre_usuario) {
      this.snackBar.open('Nombre de usuario es requerido', 'Cerrar', { duration: 3000 });
      return;
    }

    // Si hay contraseña, validar longitud
    if (this.password && this.password.length < 6) {
      this.snackBar.open('La contraseña debe tener al menos 6 caracteres', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;

    const userData: any = {
      nombre_usuario: this.nombre_usuario,
      nombre_completo: this.nombre_completo || this.nombre_usuario,
      correo: this.correo || null,
      rol_id: this.rol_id
    };

    // Solo incluir password si se proporcionó uno nuevo
    if (this.password) {
      userData.password = this.password;
    }

    this.http.put(`${environment.apiUrl}/usuarios/${this.usuarioId}`, userData).subscribe({
      next: (response) => {
        this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al actualizar usuario:', error);
        const mensaje = error.error?.error || 'Error al actualizar usuario';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
