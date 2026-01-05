import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;

  roles = [
    { value: 'MESERO', label: 'Mesero' },
    { value: 'CAJERO', label: 'Cajero' },
    { value: 'COCINA', label: 'Cocina' },
    { value: 'BEBIDAS', label: 'Bebidas' },
    { value: 'ADMINISTRADOR', label: 'Administrador' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['MESERO', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.snackBar.open('Usuario registrado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          const message = error.error?.error || 'Error al registrar usuario';
          this.snackBar.open(message, 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
