import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CarritoService } from './services/carrito.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SeyFert');
  protected readonly carrito = inject(CarritoService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
