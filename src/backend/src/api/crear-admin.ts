import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from './config/db';

dotenv.config();

async function crearAdmin() {
  const [email, clave, nombre = 'Sandra'] = process.argv.slice(2);

  if (!email || !clave) {
    console.error('Uso: crear-admin <correo> <clave> [nombre]');
    process.exit(1);
  }
  if (clave.length < 8 || clave.length > 72 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    console.error('Usa un correo válido y una clave de 8 a 72 caracteres.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(clave, 10);

  await pool.query(
    `INSERT INTO usuario (nombre, email, password, rol)
     VALUES ($1, $2, $3, 'ADMIN')
     ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, rol = 'ADMIN', activo = TRUE,
       nombre = EXCLUDED.nombre, email = EXCLUDED.email`,
    [nombre.trim(), email.trim().toLowerCase(), hash],
  );

  console.log('Admin creado o clave actualizada:', email);
  await pool.end();
}

crearAdmin().catch((e) => {
  console.error(e);
  process.exit(1);
});
