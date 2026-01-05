import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      nombre_usuario: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      
      // Limpiar espacios en blanco
      const credentials = {
        nombre_usuario: this.loginForm.value.nombre_usuario?.trim(),
        password: this.loginForm.value.password?.trim()
      };
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('✅ Login exitoso, respuesta:', response);
          console.log('✅ Token después del login:', this.authService.getToken());
          console.log('✅ Usuario autenticado:', this.authService.isAuthenticated());
          
          this.snackBar.open(response.message || 'Login exitoso', 'Cerrar', { duration: 3000 });
          
          // Pequeño delay para asegurar que el token se guarde
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 100);
        },
        error: (error) => {
          this.loading = false;
          console.error('❌ Error de login:', error);
          console.error('❌ Error completo:', JSON.stringify(error, null, 2));
          const message = error.error?.error || error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
          this.snackBar.open(message, 'Cerrar', { duration: 5000 });
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}
