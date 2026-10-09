import dotenv from 'dotenv';
import express, { ErrorRequestHandler } from 'express';
import { authRouter } from './api/routes/auth.routes';
import { pedidoRouter } from './api/routes/pedido.routes';
import { productoRouter } from './api/routes/producto.routes';
import { crearRouterCatalogo } from './api/routes/catalogo.routes';
import { dashboardRouter } from './api/routes/dashboard.routes';

dotenv.config();

const app = express();
const origins = new Set(
  (process.env['CORS_ORIGINS'] ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !origins.has(origin)) {
    res.status(403).json({ mensaje: 'Origen no permitido' });
    return;
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ estado: 'ok' }));
app.use('/api/productos', productoRouter);
app.use('/api/categorias', crearRouterCatalogo('categoria'));
app.use('/api/marcas', crearRouterCatalogo('marca'));
app.use('/api/pedidos', pedidoRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/auth', authRouter);
app.use('/api', (_req, res) => res.status(404).json({ mensaje: 'Endpoint no encontrado' }));

const manejarError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  console.error('Error no controlado en la API:', error);
  res.status(500).json({ mensaje: 'Ocurrió un error interno. Intenta de nuevo más tarde.' });
};
app.use(manejarError);

const port = Number(process.env['PORT'] ?? 4001);
app.listen(port, () => console.log(`SeyFert API listening on http://localhost:${port}`));
