
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

/**
 * Development-only connection check. In production it answers 404, so the
 * database name, user, version and tables are never exposed publicly.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }
  try {
    const [connection] = await pool.query(
      `SELECT
        DATABASE() AS database_name,
        CURRENT_USER() AS mysql_user,
        VERSION() AS mysql_version`
    );

    const [tables] = await pool.query("SHOW TABLES");

    return NextResponse.json({
      success: true,
      message: "MySQL connection successful",
      connection,
      tables,
    });
  } catch (error) {
    console.error("MySQL connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "MySQL connection failed",
      },
      { status: 500 }
    );
  }
}

