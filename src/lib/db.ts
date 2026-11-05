
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  socketPath: process.env.DB_SOCKET_PATH,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

