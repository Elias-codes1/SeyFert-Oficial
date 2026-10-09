import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, PerfilUsuario } from '../../services/auth.service';

@Component({ selector: 'app-perfil', standalone: true, imports: [RouterLink, ReactiveFormsModule], templateUrl: './perfil.html', styleUrl: './perfil.css' })
export class Perfil {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
  });
  protected readonly usuario = signal<PerfilUsuario | null>(null);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  constructor() {
    this.auth.obtenerPerfil().subscribe({
      next: (u) => { this.usuario.set(u); this.form.setValue({ nombre: u.nombre, email: u.email }); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar el perfil. Vuelve a iniciar sesión.'); this.cargando.set(false); },
    });
  }
  protected guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true); this.mensaje.set(''); this.error.set('');
    const valores = this.form.getRawValue();
    this.auth.actualizarPerfil({ nombre: valores.nombre.trim(), email: valores.email.trim() }).subscribe({
      next: (u) => { this.usuario.set(u); this.form.setValue({ nombre: u.nombre, email: u.email }); this.mensaje.set('Perfil actualizado.'); this.guardando.set(false); },
      error: (e) => { this.error.set(e.error?.mensaje ?? 'No se pudo guardar el perfil.'); this.guardando.set(false); },
    });
  }
  protected cerrarSesion(): void { this.auth.logout(); this.router.navigate(['/']); }
}
