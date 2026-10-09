import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly usuario = signal('');
  protected readonly clave = signal('');
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  protected ingresar(): void {
    if (!this.usuario().trim() || !this.clave().trim() || this.cargando()) return;

    this.cargando.set(true);
    this.error.set('');

    this.auth.login({ usuario: this.usuario().trim(), clave: this.clave().trim() }).subscribe({
      next: (resultado) => {
        this.cargando.set(false);
        this.router.navigate([resultado.rol === 'CLIENTE' ? '/perfil' : '/admin/dashboard']);
      },
      error: () => {
        this.error.set('Credenciales incorrectas. Verifique usuario y contraseña.');
        this.cargando.set(false);
      },
    });
  }
}
