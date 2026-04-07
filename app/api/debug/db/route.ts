import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM movies) as movie_count,
        (SELECT email FROM users WHERE role = 'ADMIN' LIMIT 1) as admin_email
    `);
    
    await pool.end();
    
    return NextResponse.json({
      status: "connected",
      database: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"),
      data: result.rows[0],
    });
  } catch (error: unknown) {
    await pool.end();
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      status: "error",
      error: errorMessage,
    }, { status: 500 });
  }
}
