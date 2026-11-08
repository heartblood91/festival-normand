import "dotenv/config"
import { Client } from "pg"

/** Runs one query on the local database (DATABASE_URL), for fixtures the UI cannot create. */
export const query = async <Row extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    return (await client.query<Row>(sql, params)).rows
  } finally {
    await client.end()
  }
}

export const hasDatabase = () => !!process.env.DATABASE_URL
