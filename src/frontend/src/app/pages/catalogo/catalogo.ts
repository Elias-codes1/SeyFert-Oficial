import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { CatalogoAdminService } from '../../services/catalogo-admin.service';
import { ProductoService } from '../../services/producto.service';
import { CatalogoItem } from '../../models/catalogo';
import { FiltrosProducto, Genero, PaginaProductos, Producto } from '../../models/producto';
import { claseDisponibilidad, parsearPrecioFiltro, textoDisponibilidad as textoStock } from '../../utils/catalogo.utils';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private readonly productosApi = inject(ProductoService);
  private readonly catalogosApi = inject(CatalogoAdminService);
  protected readonly carrito = inject(CarritoService);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly filtrados = computed(() => this.productos());
  protected readonly categorias = signal<CatalogoItem[]>([]);
  protected readonly marcas = signal<CatalogoItem[]>([]);
  protected readonly busqueda = signal('');
  protected readonly categoria = signal('');
  protected readonly marca = signal('');
  protected readonly genero = signal('');
  protected readonly precioMin = signal<number | null>(null);
  protected readonly precioMax = signal<number | null>(null);
  protected readonly pagina = signal<PaginaProductos | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);
  protected readonly hayFiltros = computed(
    () => Boolean(this.busqueda().trim() || this.categoria() || this.marca() || this.genero() || this.precioMin() !== null || this.precioMax() !== null),
  );
  protected readonly generos: [Genero, string][] = [
    ['DAMA', 'Dama'],
    ['CABALLERO', 'Caballero'],
    ['UNISEX', 'Unisex'],
  ];
  private secuencia = 0;
  private temporizadorBusqueda?: ReturnType<typeof setTimeout>;

  constructor() {
    this.catalogosApi.listarPublico('categorias').subscribe({ next: (items) => this.categorias.set(items) });
    this.catalogosApi.listarPublico('marcas').subscribe({ next: (items) => this.marcas.set(items) });
    this.cargar();
  }

  protected cambiarBusqueda(valor: string): void {
    this.busqueda.set(valor);
    if (this.temporizadorBusqueda) clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => this.cargar(1), 300);
  }

  protected cambiarCategoria(valor: string): void { this.categoria.set(valor); this.cargar(1); }
  protected cambiarMarca(valor: string): void { this.marca.set(valor); this.cargar(1); }
  protected cambiarGenero(valor: string): void { this.genero.set(valor); this.cargar(1); }
  protected cambiarPrecioMin(valor: string): void { this.precioMin.set(this.leerPrecio(valor)); this.cargar(1); }
  protected cambiarPrecioMax(valor: string): void { this.precioMax.set(this.leerPrecio(valor)); this.cargar(1); }
  protected leerPrecio(valor: string): number | null { return parsearPrecioFiltro(valor); }

  protected limpiarFiltros(): void {
    this.busqueda.set(''); this.categoria.set(''); this.marca.set(''); this.genero.set('');
    this.precioMin.set(null); this.precioMax.set(null); this.cargar(1);
  }

  protected irPagina(direccion: -1 | 1): void {
    const siguiente = (this.pagina()?.page ?? 1) + direccion;
    if (siguiente >= 1 && siguiente <= (this.pagina()?.totalPages ?? 1)) this.cargar(siguiente);
  }

  protected etiquetaGenero(genero: Genero): string {
    return this.generos.find(([valor]) => valor === genero)?.[1] ?? genero;
  }
  protected disponibilidad(stock: number): string { return claseDisponibilidad(stock); }
  protected textoDisponibilidad(stock: number): string { return textoStock(stock); }
  protected enCarrito(id: number): number { return this.carrito.cantidadDe(id); }
  protected agregar(producto: Producto): void { this.carrito.agregar(producto); }
  protected textoBoton(producto: Producto): string {
    if (producto.stock <= 0) return 'Agotado';
    return this.enCarrito(producto.id) >= producto.stock ? 'Máximo en carrito' : 'Agregar al carrito';
  }

  private cargar(page = this.pagina()?.page ?? 1): void {
    const turno = ++this.secuencia;
    this.cargando.set(true); this.error.set(false);
    const filtros: FiltrosProducto = {
      page, pageSize: 12,
      ...(this.busqueda().trim() ? { q: this.busqueda().trim() } : {}),
      ...(this.categoria() ? { categoriaId: Number(this.categoria()) } : {}),
      ...(this.marca() ? { marcaId: Number(this.marca()) } : {}),
      ...(this.genero() ? { genero: this.genero() as Genero } : {}),
      ...(this.precioMin() === null ? {} : { precioMin: this.precioMin()! }),
      ...(this.precioMax() === null ? {} : { precioMax: this.precioMax()! }),
    };
    this.productosApi.listar(filtros).subscribe({
      next: (resultado) => {
        if (turno !== this.secuencia) return;
        this.pagina.set(resultado); this.productos.set(resultado.items); this.cargando.set(false);
      },
      error: (_error: HttpErrorResponse) => {
        if (turno !== this.secuencia) return;
        this.error.set(true); this.productos.set([]); this.cargando.set(false);
      },
    });
  }
}
