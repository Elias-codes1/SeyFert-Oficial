import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WHATSAPP_NUMERO } from '../../config';
import { ItemCarrito, PedidoCreado } from '../../models/carrito';
import { CarritoService } from '../../services/carrito.service';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-carrito',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  protected readonly carrito = inject(CarritoService);
  private readonly pedidoService = inject(PedidoService);

  protected readonly nombre = signal('');
  protected readonly telefono = signal('');
  protected readonly direccion = signal('');
  protected readonly notas = signal('');

  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly intentado = signal(false);
  protected readonly pedido = signal<PedidoCreado | null>(null);
  protected readonly enlaceWhatsapp = signal('');

  protected readonly nombreValido = computed(() => this.nombre().trim().length >= 2);
  protected readonly telefonoValido = computed(
    () => this.telefono().replace(/\D/g, '').length >= 8,
  );
  protected readonly direccionValida = computed(() => this.direccion().trim().length >= 5);
  protected readonly formularioValido = computed(
    () => this.nombreValido() && this.telefonoValido() && this.direccionValida(),
  );

  protected subtotal(item: ItemCarrito): number {
    return item.producto.precio * item.cantidad;
  }

  protected confirmar(): void {
    this.intentado.set(true);
    this.error.set('');
    if (!this.formularioValido() || this.enviando()) return;

    const items = this.carrito.items();
    if (items.length === 0) return;

    this.enviando.set(true);
    this.pedidoService
      .crear({
        nombreCliente: this.nombre().trim(),
        telefono: this.telefono().trim(),
        direccion: this.direccion().trim(),
        notas: this.notas().trim() || undefined,
        items: items.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
      })
      .subscribe({
        next: (creado) => {
          // El mensaje se arma antes de vaciar el carrito.
          this.enlaceWhatsapp.set(this.armarEnlace(creado, items));
          this.pedido.set(creado);
          this.carrito.vaciar();
          this.enviando.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.error.set(
            e.error?.mensaje ?? 'No se pudo enviar el pedido. Intenta de nuevo en un momento.',
          );
          this.enviando.set(false);
        },
      });
  }

  private armarEnlace(creado: PedidoCreado, items: ItemCarrito[]): string {
    const lineas = items.map(
      (i) =>
        `- ${i.cantidad} x ${i.producto.nombre} (${i.producto.marca}) - Q ${this.formato(this.subtotal(i))}`,
    );
    const partes = [
      `Hola, hice un pedido en SeyFert (pedido #${creado.id}):`,
      '',
      ...lineas,
      '',
      `Total: Q ${this.formato(creado.total)}`,
      '',
      `Nombre: ${this.nombre().trim()}`,
      `Teléfono: ${this.telefono().trim()}`,
      `Dirección: ${this.direccion().trim()}`,
    ];
    if (this.notas().trim()) partes.push(`Notas: ${this.notas().trim()}`);

    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(partes.join('\n'))}`;
  }

  private formato(valor: number): string {
    return valor.toFixed(2);
  }
}
