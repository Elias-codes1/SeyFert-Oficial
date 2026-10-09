import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { API_BASE_URL } from '../../../config';

export interface PedidoAdmin {
  id: number;
  nombreCliente: string;
  telefono: string;
  direccion: string;
  notas?: string;
  total: number;
  estado: EstadoPedido;
  items: { nombre: string; cantidad: number; precioUnitario: number }[];
  fechaCreacion?: string;
}

type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'ENTREGADO' | 'CANCELADO';
const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css',
})
export class AdminPedidos {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly pedidos = signal<PedidoAdmin[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly transiciones = TRANSICIONES;

  constructor() {
    this.cargarPedidos();
  }

  protected cambiarEstado(id: number, nuevoEstado: EstadoPedido): void {
    if (nuevoEstado === 'CANCELADO' && !confirm('¿Cancelar este pedido? La acción devolverá las existencias y no se puede revertir.')) {
      this.cargarPedidos();
      return;
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.token()}`);
    this.http.patch(`${API_BASE_URL}/pedidos/${id}`, { estado: nuevoEstado }, { headers }).subscribe({
      next: () => this.cargarPedidos(),
      error: () => alert('No se pudo actualizar el estado del pedido.'),
    });
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }

  private cargarPedidos(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.token()}`);
    this.http.get<PedidoAdmin[]>(`${API_BASE_URL}/pedidos`, { headers }).subscribe({
      next: (datos) => {
        this.pedidos.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la lista de pedidos.');
        this.cargando.set(false);
      },
    });
  }
}
