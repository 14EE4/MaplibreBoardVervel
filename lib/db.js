const { Pool } = require('pg')

// Expect DATABASE_URL in environment (Postgres connection string)
const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING

if (!connectionString) {
  console.warn('Warning: DATABASE_URL is not set. API will fail to connect to Postgres until configured.')
}

const pool = new Pool({ connectionString })

async function query(text, params) {
  const client = await pool.connect()
  try {
    const res = await client.query(text, params)
    return res
  } finally {
    client.release()
  }
}

module.exports = { query, pool }
