import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { API_BASE_URL } from '../../../config';

interface IndicadoresDashboard {
  productosActivos: number;
  productosBajoStock: number;
  pedidosPendientes: number;
  pedidosMes: number;
}

@Component({
  selector: 'app-admin-dashboard', standalone: true, imports: [RouterLink],
  templateUrl: './dashboard.html', styleUrl: './dashboard.css',
})
export class AdminDashboard {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly indicadores = signal<IndicadoresDashboard | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  constructor() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.token()}`);
    this.http.get<IndicadoresDashboard>(`${API_BASE_URL}/dashboard`, { headers }).subscribe({
      next: (datos) => { this.indicadores.set(datos); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar los indicadores.'); this.cargando.set(false); },
    });
  }

  protected logout(): void { this.auth.logout(); this.router.navigate(['/admin/login']); }
}
