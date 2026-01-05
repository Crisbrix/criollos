import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfiguracionService } from '../../core/services/configuracion.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss'
})
export class ConfiguracionComponent implements OnInit {
  tabActiva: string = 'general';

  config = {
    // Datos generales
    nombre: 'CriolloS',
    ruc: '20123456789',
    direccion: 'Av. Principal 123, Lima',
    telefono: '987654321',
    email: 'contacto@criollos.com',
    horaApertura: '09:00',
    horaCierre: '22:00',
    
    // Facturación
    igv: 18,
    moneda: 'PEN',
    serieBoleta: 'B001',
    serieFactura: 'F001',
    impresionAutomatica: true,
    logoEnTicket: true,
    
    // Notificaciones
    notifEmail: true,
    alertaStock: true,
    reporteDiario: true,
    
    // Sistema
    dobleAutenticacion: false,
    cierreAutomatico: true
  };

  constructor(
    private snackBar: MatSnackBar,
    private configuracionService: ConfiguracionService
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    this.configuracionService.obtener().subscribe({
      next: (response) => {
        const cfg = response.configuracion;
        // Actualizar solo los campos que vienen del backend
        this.config.nombre = cfg.nombreRestaurante || 'CriolloS';
        this.config.ruc = cfg.ruc || '';
        this.config.direccion = cfg.direccion || '';
        this.config.telefono = cfg.telefono || '';
        this.config.email = cfg.email || '';
        this.config.igv = cfg.igv || 18;
      },
      error: (error) => {
        console.error('Error al cargar configuración:', error);
      }
    });
  }

  cambiarTab(tab: string): void {
    this.tabActiva = tab;
  }

  guardarConfiguracion(): void {
    const dataToSave = {
      nombreRestaurante: this.config.nombre,
      ruc: this.config.ruc,
      direccion: this.config.direccion,
      telefono: this.config.telefono,
      email: this.config.email,
      igv: this.config.igv
    };

    this.configuracionService.actualizar(dataToSave).subscribe({
      next: (response) => {
        this.snackBar.open('Configuración guardada correctamente', 'Cerrar', { 
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Error al guardar configuración:', error);
        this.snackBar.open('Error al guardar la configuración', 'Cerrar', { 
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  crearRespaldo(): void {
    this.snackBar.open('Creando respaldo de datos...', 'Cerrar', { duration: 2000 });
    // TODO: Implementar lógica de respaldo
  }
}
