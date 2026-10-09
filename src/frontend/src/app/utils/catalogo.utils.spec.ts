import { describe, expect, it } from 'vitest';
import { claseDisponibilidad, parsearPrecioFiltro, textoDisponibilidad } from './catalogo.utils';

describe('utilidades del catálogo', () => {
  it('convierte filtros de precio y deja vacío cuando no hay valor válido', () => {
    expect(parsearPrecioFiltro(' 25.50 ')).toBe(25.5);
    expect(parsearPrecioFiltro('')).toBeNull();
    expect(parsearPrecioFiltro('-1')).toBeNull();
    expect(parsearPrecioFiltro('no es número')).toBeNull();
  });

  it('muestra disponibilidad según las existencias', () => {
    expect(claseDisponibilidad(0)).toBe('agotado');
    expect(claseDisponibilidad(5)).toBe('pocas');
    expect(claseDisponibilidad(6)).toBe('disponible');
    expect(textoDisponibilidad(2)).toBe('Quedan 2');
  });
});
