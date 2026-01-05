import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.scss'
})
export class UsuariosListComponent implements OnInit {
  usuarios: any[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (response) => {
        this.usuarios = response.usuarios || [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al cargar usuarios:', error);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  nuevoUsuario(): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: false,
      data: { usuario: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarUsuarios();
      }
    });
  }

  editarUsuario(usuario: any): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: false,
      data: { usuario: { ...usuario } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarUsuarios();
      }
    });
  }

  eliminarUsuario(usuario: any): void {
    if (confirm(`¿Estás seguro de eliminar al usuario "${usuario.nombre_completo}"?`)) {
      this.http.delete(`${environment.apiUrl}/usuarios/${usuario.id}`)
        .subscribe({
          next: () => {
            this.snackBar.open('Usuario eliminado exitosamente', 'Cerrar', { duration: 3000 });
            this.cargarUsuarios();
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            const mensaje = error.error?.error || 'Error al eliminar usuario';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
          }
        });
    }
  }

  getRoleName(rol_id: number): string {
    const roles: any = {
      1: 'Administrador',
      2: 'Cajero',
      3: 'Mesero',
      4: 'Cocina',
      5: 'Bebidas'
    };
    return roles[rol_id] || 'Usuario';
  }

  toggleActivo(usuario: any): void {
    const nuevoEstado = !usuario.activo;
    this.http.put(`${environment.apiUrl}/usuarios/${usuario.id}/estado`, { activo: nuevoEstado })
      .subscribe({
        next: () => {
          usuario.activo = nuevoEstado;
          this.snackBar.open(
            `Usuario ${nuevoEstado ? 'activado' : 'desactivado'}`,
            'Cerrar',
            { duration: 2000 }
          );
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
          this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
        }
      });
  }
}
