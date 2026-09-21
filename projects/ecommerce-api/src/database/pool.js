// =====================================================================
// EN: Single shared pg.Pool for the whole process. Every module that needs
// the database imports THIS pool; nobody creates their own. Reads the
// connection string from DATABASE_URL in .env (see .env.example). In
// Supabase, append ?sslmode=require to the URL; local PostgreSQL works
// without it.
//
// ES: Un único pg.Pool compartido para todo el proceso. Todo módulo que
// necesite la base importa ESTE pool; nadie crea el suyo. Lee la cadena de
// conexión de DATABASE_URL en .env (ver .env.example). En Supabase,
// agrega ?sslmode=require a la URL; el PostgreSQL local funciona sin eso.
// =====================================================================

// EN: loads process.env from the .env file at the project root.
// ES: carga process.env desde el archivo .env en la raíz del proyecto.
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

// EN: fail early with an actionable message instead of a cryptic error on
// the first query minutes later.
// ES: falla temprano con un mensaje accionable en lugar de un error críptico
// en la primera consulta minutos después.
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// EN: idle clients can emit 'error' (server restart, paused Supabase
// project). Without this handler that event would crash the process; with
// it the API stays alive and the next query fails in a controlled way.
// ES: los clientes inactivos pueden emitir 'error' (reinicio del servidor,
// proyecto Supabase pausado). Sin este handler ese evento tumbaría el
// proceso; con él la API sigue viva y la siguiente consulta falla de forma
// controlada.
pool.on('error', (error) => {
  console.error('[pool] idle client error:', error.code ?? error.message);
});