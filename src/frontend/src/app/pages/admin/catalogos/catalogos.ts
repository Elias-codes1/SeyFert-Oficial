import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CatalogoItem, TipoCatalogo } from '../../../models/catalogo';
import { AuthService } from '../../../services/auth.service';
import { CatalogoAdminService } from '../../../services/catalogo-admin.service';

@Component({
  selector: 'app-admin-catalogos', standalone: true, imports: [RouterLink],
  templateUrl: './catalogos.html', styleUrl: './catalogos.css',
})
export class AdminCatalogos {
  private readonly service = inject(CatalogoAdminService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly categorias = signal<CatalogoItem[]>([]);
  protected readonly marcas = signal<CatalogoItem[]>([]);
  protected readonly nuevaCategoria = signal('');
  protected readonly nuevaMarca = signal('');
  protected readonly editando = signal<{ tipo: TipoCatalogo; id: number } | null>(null);
  protected readonly nombreEdicion = signal('');
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');

  constructor() { this.cargar(); }

  protected crear(tipo: TipoCatalogo): void {
    const nombre = (tipo === 'categorias' ? this.nuevaCategoria() : this.nuevaMarca()).trim();
    if (this.guardando() || nombre.length < 2) return;
    this.guardando.set(true); this.error.set(''); this.mensaje.set('');
    this.service.crear(tipo, nombre).subscribe({
      next: () => {
        if (tipo === 'categorias') this.nuevaCategoria.set(''); else this.nuevaMarca.set('');
        this.mensaje.set('Elemento creado.'); this.guardando.set(false); this.cargar();
      },
      error: (e) => { this.error.set(e.error?.mensaje ?? 'No se pudo crear el elemento.'); this.guardando.set(false); },
    });
  }

  protected iniciarEdicion(tipo: TipoCatalogo, item: CatalogoItem): void {
    this.editando.set({ tipo, id: item.id }); this.nombreEdicion.set(item.nombre);
  }

  protected guardarEdicion(): void {
    const edicion = this.editando();
    if (!edicion || this.guardando()) return;
    this.guardando.set(true); this.error.set(''); this.mensaje.set('');
    this.service.actualizar(edicion.tipo, edicion.id, this.nombreEdicion().trim()).subscribe({
      next: () => { this.editando.set(null); this.mensaje.set('Cambios guardados.'); this.guardando.set(false); this.cargar(); },
      error: (e) => { this.error.set(e.error?.mensaje ?? 'No se pudo actualizar el elemento.'); this.guardando.set(false); },
    });
  }

  protected desactivar(tipo: TipoCatalogo, item: CatalogoItem): void {
    if (!confirm(`¿Desactivar “${item.nombre}”? Los productos existentes conservarán la referencia.`)) return;
    this.error.set(''); this.mensaje.set('');
    this.service.desactivar(tipo, item.id).subscribe({
      next: () => { this.mensaje.set('Elemento desactivado.'); this.cargar(); },
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo desactivar el elemento.'),
    });
  }

  protected cancelarEdicion(): void { this.editando.set(null); }
  protected logout(): void { this.auth.logout(); this.router.navigate(['/admin/login']); }

  private cargar(): void {
    this.cargando.set(true);
    this.service.listar('categorias').subscribe({
      next: (items) => { this.categorias.set(items); this.cargarMarcas(); },
      error: () => { this.error.set('No se pudieron cargar las categorías.'); this.cargando.set(false); },
    });
  }

  private cargarMarcas(): void {
    this.service.listar('marcas').subscribe({
      next: (items) => { this.marcas.set(items); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar las marcas.'); this.cargando.set(false); },
    });
  }
}
