import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { ItemCarrito } from '../models/carrito';
import { Producto } from '../models/producto';

const CLAVE_ALMACEN = 'seyfert-carrito';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  readonly items = signal<ItemCarrito[]>([]);

  readonly cantidadTotal = computed(() =>
    this.items().reduce((suma, i) => suma + i.cantidad, 0),
  );

  readonly total = computed(() =>
    this.items().reduce((suma, i) => suma + i.producto.precio * i.cantidad, 0),
  );

  constructor() {
    // Se lee después de la hidratación para que el HTML del servidor y el del cliente coincidan.
    afterNextRender(() => this.cargar());
  }

  cantidadDe(productoId: number): number {
    return this.items().find((i) => i.producto.id === productoId)?.cantidad ?? 0;
  }

  agregar(producto: Producto): void {
    if (producto.stock <= 0) return;
    const actual = this.cantidadDe(producto.id);
    if (actual >= producto.stock) return;

    if (actual === 0) {
      this.items.update((lista) => [...lista, { producto, cantidad: 1 }]);
    } else {
      this.items.update((lista) =>
        lista.map((i) =>
          i.producto.id === producto.id ? { producto, cantidad: actual + 1 } : i,
        ),
      );
    }
    this.guardar();
  }

  cambiarCantidad(productoId: number, cantidad: number): void {
    if (cantidad < 1) {
      this.quitar(productoId);
      return;
    }
    this.items.update((lista) =>
      lista.map((i) =>
        i.producto.id === productoId
          ? { ...i, cantidad: Math.min(cantidad, i.producto.stock) }
          : i,
      ),
    );
    this.guardar();
  }

  quitar(productoId: number): void {
    this.items.update((lista) => lista.filter((i) => i.producto.id !== productoId));
    this.guardar();
  }

  vaciar(): void {
    this.items.set([]);
    this.guardar();
  }

  private cargar(): void {
    try {
      const texto = localStorage.getItem(CLAVE_ALMACEN);
      if (!texto) return;
      const datos = JSON.parse(texto);
      if (!Array.isArray(datos)) return;
      const validos = datos.filter(
        (i) =>
          i &&
          typeof i.cantidad === 'number' &&
          i.cantidad > 0 &&
          i.producto &&
          typeof i.producto.id === 'number' &&
          typeof i.producto.precio === 'number',
      ) as ItemCarrito[];
      this.items.set(validos);
    } catch {
      // Si el almacenamiento está dañado o bloqueado, se empieza con el carrito vacío.
    }
  }

  private guardar(): void {
    if (!this.esNavegador) return;
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(this.items()));
    } catch {
      // Sin almacenamiento disponible el carrito sigue funcionando mientras la página esté abierta.
    }
  }
}
