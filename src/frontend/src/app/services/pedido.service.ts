import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PedidoCreado, PedidoDatos } from '../models/carrito';
import { API_BASE_URL } from '../config';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);

  crear(datos: PedidoDatos): Observable<PedidoCreado> {
    return this.http
      .post<PedidoCreado>(`${API_BASE_URL}/pedidos`, datos)
      .pipe(
        map((r) => ({ id: Number(r.id), total: Number(r.total) })),
        catchError((error: HttpErrorResponse) => {
          // Re-propagamos el error controlado para que la vista de Carrito lo procese
          return throwError(() => error);
        })
      );
  }
}
