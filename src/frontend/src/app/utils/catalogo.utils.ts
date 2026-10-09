export function parsearPrecioFiltro(valor: string): number | null {
  const texto = valor.trim();
  if (!texto) return null;
  const numero = Number(texto);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

export function claseDisponibilidad(stock: number): 'agotado' | 'pocas' | 'disponible' {
  return stock <= 0 ? 'agotado' : stock <= 5 ? 'pocas' : 'disponible';
}

export function textoDisponibilidad(stock: number): string {
  return stock <= 0 ? 'Agotado' : stock <= 5 ? `Quedan ${stock}` : 'Disponible';
}
