import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { FiltrosProducto, PaginaProductos } from '../models/producto';
import { API_BASE_URL } from '../config';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);

  listar(filtros: FiltrosProducto): Observable<PaginaProductos> {
    const params = Object.entries(filtros).reduce(
      (query, [key, value]) => query.set(key, String(value)),
      new HttpParams(),
    );
    return this.http.get<PaginaProductos>(`${API_BASE_URL}/productos`, { params }).pipe(
      map((pagina) => ({
        ...pagina,
        items: pagina.items.map((p) => ({ ...p, id: Number(p.id), categoriaId: Number(p.categoriaId), marcaId: Number(p.marcaId), precio: Number(p.precio), stock: Number(p.stock) })),
      })),
    );
  }
}
