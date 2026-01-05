import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MesasService } from '../../../core/services/mesas.service';

@Component({
  selector: 'app-mesa-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './mesa-form.component.html',
  styleUrl: './mesa-form.component.scss'
})
export class MesaFormComponent implements OnInit {
  mesa: any = {
    nombre: '',
    cantidad_personas: 4,
    estado: 'libre'
  };

  isEdit = false;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<MesaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mesa?: any },
    private snackBar: MatSnackBar,
    private mesasService: MesasService
  ) {}

  ngOnInit(): void {
    if (this.data?.mesa) {
      this.isEdit = true;
      this.mesa = { ...this.data.mesa };
    }
  }

  validarFormulario(): boolean {
    if (!this.mesa.nombre || this.mesa.nombre.trim() === '') {
      this.snackBar.open('El nombre de la mesa es requerido', 'Cerrar', { duration: 3000 });
      return false;
    }

    if (this.mesa.cantidad_personas < 1) {
      this.snackBar.open('La capacidad debe ser al menos 1 persona', 'Cerrar', { duration: 3000 });
      return false;
    }

    if (this.mesa.cantidad_personas > 20) {
      this.snackBar.open('La capacidad máxima es de 20 personas', 'Cerrar', { duration: 3000 });
      return false;
    }

    return true;
  }

  guardar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;

    if (this.isEdit) {
      // Actualizar mesa existente
      this.mesasService.actualizar(this.mesa.id.toString(), this.mesa).subscribe({
        next: (response) => {
          this.snackBar.open('Mesa actualizada exitosamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al actualizar mesa:', error);
          this.snackBar.open('Error al actualizar mesa', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      // Crear nueva mesa
      this.mesasService.crear(this.mesa).subscribe({
        next: (response) => {
          this.snackBar.open('Mesa creada exitosamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al crear mesa:', error);
          this.snackBar.open('Error al crear mesa', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
