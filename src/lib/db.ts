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

const pool = mysql.createPool({
  ...connectionOptions(),
  waitForConnections: true,
  // Serverless functions each open their own pool; keep it small.
  connectionLimit: process.env.VERCEL ? 3 : 10,
  queueLimit: 0,
});

export default pool;
