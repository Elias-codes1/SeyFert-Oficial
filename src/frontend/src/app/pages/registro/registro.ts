import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro', standalone: true, imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './registro.html', styleUrl: './registro.css',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    clave: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  protected registrar(): void {
    if (this.cargando()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.cargando.set(true); this.error.set('');
    const valores = this.form.getRawValue();
    this.auth.registrar({ nombre: valores.nombre.trim(), email: valores.email.trim(), clave: valores.clave }).subscribe({
      next: () => { this.cargando.set(false); this.router.navigate(['/perfil']); },
      error: (e) => { this.error.set(e.error?.mensaje ?? 'No se pudo crear la cuenta.'); this.cargando.set(false); },
    });
  }
}
