import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../../config';
import { CatalogoItem } from '../../../models/catalogo';
import { Genero, Producto } from '../../../models/producto';
import { AuthService } from '../../../services/auth.service';
import { CatalogoAdminService } from '../../../services/catalogo-admin.service';

@Component({
  selector: 'app-admin-productos', standalone: true, imports: [DecimalPipe, RouterLink],
  templateUrl: './productos.html', styleUrl: './productos.css',
})
export class AdminProductos {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly catalogoService = inject(CatalogoAdminService);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly categorias = signal<CatalogoItem[]>([]);
  protected readonly marcas = signal<CatalogoItem[]>([]);
  protected readonly cargando = signal(true);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly nombre = signal('');
  protected readonly marcaId = signal<number>(0);
  protected readonly categoriaId = signal<number>(0);
  protected readonly genero = signal<Genero>('DAMA');
  protected readonly precio = signal<number>(0);
  protected readonly stock = signal<number>(1);
  protected readonly descripcion = signal('');

  constructor() {
    this.cargarProductos();
    this.cargarCatalogos();
  }

  protected guardarProducto(): void {
    if (!this.nombre().trim() || this.precio() <= 0 || this.stock() < 0 ||
        !this.categoriaId() || !this.marcaId()) {
      this.error.set('Completa el nombre, precio, stock, categoría y marca.');
      return;
    }
    const payload = {
      nombre: this.nombre().trim(), marcaId: Number(this.marcaId()),
      categoriaId: Number(this.categoriaId()), genero: this.genero(),
      precio: Number(this.precio()), stock: Number(this.stock()),
      descripcion: this.descripcion().trim() || null,
    };
    const headers = this.headers();
    const id = this.editandoId();
    const solicitud = id
      ? this.http.put(`${API_BASE_URL}/productos/${id}`, payload, { headers })
      : this.http.post(`${API_BASE_URL}/productos`, payload, { headers });
    this.error.set(''); this.mensaje.set('');
    solicitud.subscribe({
      next: () => {
        this.limpiarFormulario(); this.editandoId.set(null);
        this.mensaje.set(id ? 'Producto actualizado.' : 'Producto creado.');
        this.cargarProductos();
      },
      error: (e) => this.error.set(e.error?.mensaje ?? 'Error al guardar el producto.'),
    });
  }

  protected editar(producto: Producto): void {
    this.editandoId.set(producto.id); this.nombre.set(producto.nombre);
    this.marcaId.set(Number(producto.marcaId)); this.categoriaId.set(Number(producto.categoriaId));
    this.genero.set(producto.genero); this.precio.set(Number(producto.precio));
    this.stock.set(producto.stock); this.descripcion.set(producto.descripcion ?? '');
    this.error.set(''); this.mensaje.set('');
  }

  protected cancelarEdicion(): void { this.editandoId.set(null); this.limpiarFormulario(); }

  protected desactivar(id: number): void {
    if (!confirm('¿Desactivar este producto? Dejará de aparecer en el catálogo.')) return;
    this.http.delete(`${API_BASE_URL}/productos/${id}`, { headers: this.headers() }).subscribe({
      next: () => { this.mensaje.set('Producto desactivado.'); this.cargarProductos(); },
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo desactivar el producto.'),
    });
  }

  protected activar(id: number): void {
    this.http.patch(`${API_BASE_URL}/productos/${id}/activar`, {}, { headers: this.headers() }).subscribe({
      next: () => { this.mensaje.set('Producto activado.'); this.cargarProductos(); },
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo activar el producto.'),
    });
  }

  protected logout(): void { this.auth.logout(); this.router.navigate(['/admin/login']); }

  private headers(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.auth.token()}`);
  }

  private cargarProductos(): void {
    this.cargando.set(true);
    this.http.get<Producto[]>(`${API_BASE_URL}/productos/admin`, { headers: this.headers() }).subscribe({
      next: (datos) => { this.productos.set(datos); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar el inventario.'); this.cargando.set(false); },
    });
  }

  private cargarCatalogos(): void {
    this.catalogoService.listar('categorias').subscribe({ next: (items) => this.categorias.set(items) });
    this.catalogoService.listar('marcas').subscribe({ next: (items) => this.marcas.set(items) });
  }

  private limpiarFormulario(): void {
    this.nombre.set(''); this.marcaId.set(0); this.categoriaId.set(0);
    this.genero.set('DAMA'); this.precio.set(0); this.stock.set(1); this.descripcion.set('');
  }
}
