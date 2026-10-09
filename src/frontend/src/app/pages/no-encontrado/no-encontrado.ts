import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado', standalone: true, imports: [RouterLink],
  template: `<section class="pagina-404"><p class="codigo">404</p><h1>No encontramos esa página</h1><p>La dirección puede haber cambiado o no existir.</p><a routerLink="/">Volver al catálogo</a></section>`,
  styles: [`.pagina-404{max-width:600px;margin:5rem auto;text-align:center;padding:2rem}.codigo{font-size:5rem;font-weight:800;color:var(--acento);margin:0}.pagina-404 p{color:var(--texto-suave)}.pagina-404 a{display:inline-block;margin-top:1rem;padding:.7rem 1rem;background:var(--acento);color:#fff;border-radius:8px;text-decoration:none}`],
})
export class NoEncontrado {}
