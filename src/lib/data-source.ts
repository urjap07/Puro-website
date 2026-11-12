/**
 * Is a MySQL database configured? Locally the AMPPS socket counts; in hosted
 * environments DATABASE_URL or DB_HOST does. Without one (e.g. a Netlify
 * deploy before a hosted database is set up) the site reads the bundled
 * catalogue snapshot in src/data/catalogue-snapshot.json instead.
 */
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL || process.env.DB_HOST || process.env.DB_SOCKET_PATH);
}
