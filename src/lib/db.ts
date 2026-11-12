import mysql from "mysql2/promise";

/**
 * Local development connects through the AMPPS socket (DB_SOCKET_PATH).
 * Hosted environments (e.g. Vercel) connect over TCP using either
 * DATABASE_URL=mysql://user:pass@host:port/db or DB_HOST/DB_PORT,
 * with TLS enabled via DB_SSL=true (required by most cloud MySQL providers).
 */
function connectionOptions(): mysql.PoolOptions {
  const ssl =
    process.env.DB_SSL === "true"
      ? { minVersion: "TLSv1.2", rejectUnauthorized: true, ca: process.env.DB_SSL_CA || undefined }
      : undefined;

  if (process.env.DATABASE_URL) {
    return { uri: process.env.DATABASE_URL, ssl };
  }

  if (process.env.DB_HOST) {
    return {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME,
      ssl,
    };
  }

  return {
    socketPath: process.env.DB_SOCKET_PATH,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  };
}

/** Running as serverless functions (Vercel, or Netlify, whose functions run on AWS Lambda)? */
const SERVERLESS = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);

function createPool() {
  return mysql.createPool({
    ...connectionOptions(),
    waitForConnections: true,
    // Serverless functions each open their own pool; keep it small so the
    // database's connection limit isn't exhausted. DB_POOL_SIZE overrides.
    connectionLimit: Number(process.env.DB_POOL_SIZE) || (SERVERLESS ? 3 : 10),
    // Close connections that sit idle, so stale pools never pile up.
    maxIdle: 2,
    idleTimeout: 30_000,
    queueLimit: 0,
  });
}

/**
 * Reuse one pool across hot reloads in development; otherwise every edit
 * would open a fresh pool and eventually hit MySQL's connection limit.
 */
const globalForDb = globalThis as typeof globalThis & { __puroPool?: mysql.Pool };
const pool = globalForDb.__puroPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.__puroPool = pool;

export default pool;
