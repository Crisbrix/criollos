import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MesaDetalleComponent } from '../mesa-detalle/mesa-detalle.component';
import { MesaFormComponent } from '../mesa-form/mesa-form.component';
import { MesasService } from '../../../core/services/mesas.service';

interface Mesa {
  id: number;
  nombre: string;
  cantidad_personas: number;
  estado: string;
  pedido_activo?: any;
}

@Component({
  selector: 'app-mesas-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './mesas-list.component.html',
  styleUrl: './mesas-list.component.scss'
})
export class MesasListComponent implements OnInit {
  mesas: Mesa[] = [];
  loading = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private mesasService: MesasService
  ) {}

  ngOnInit(): void {
    this.cargarMesas();
    // Actualizar cada 10 segundos
    setInterval(() => {
      this.cargarMesas();
    }, 10000);
  }

  cargarMesas(): void {
    this.loading = true;
    
    this.mesasService.listar().subscribe({
      next: (response) => {
        this.mesas = response.mesas;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al cargar mesas:', error);
        this.snackBar.open('Error al cargar mesas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  verDetalleMesa(mesa: Mesa): void {
    if (mesa.estado === 'libre') {
      this.snackBar.open('Esta mesa está libre', 'Cerrar', { duration: 2000 });
      return;
    }

    const dialogRef = this.dialog.open(MesaDetalleComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { mesa }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarMesas();
      }
    });
  }

  getEstadoClass(estado: string): string {
    const classes: any = {
      'libre': 'estado-libre',
      'ocupada': 'estado-ocupada',
      'reservada': 'estado-reservada'
    };
    return classes[estado] || 'estado-libre';
  }

  getEstadoIcon(estado: string): string {
    const icons: any = {
      'libre': 'check_circle',
      'ocupada': 'restaurant',
      'reservada': 'schedule'
    };
    return icons[estado] || 'check_circle';
  }

  getMesasLibres(): number {
    return this.mesas.filter(m => m.estado === 'libre').length;
  }

  getMesasOcupadas(): number {
    return this.mesas.filter(m => m.estado === 'ocupada').length;
  }

  getMesasReservadas(): number {
    return this.mesas.filter(m => m.estado === 'reservada').length;
  }

  nuevaMesa(): void {
    const dialogRef = this.dialog.open(MesaFormComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarMesas();
      }
    });
  }
}
