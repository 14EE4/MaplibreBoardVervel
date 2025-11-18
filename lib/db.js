const { Pool } = require('pg')

// Expect DATABASE_URL in environment (Postgres connection string)
const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING

if (!connectionString) {
  console.warn('Warning: DATABASE_URL is not set. API will fail to connect to Postgres until configured.')
}

// Reuse pool across module reloads / lambda warm invocations to avoid too many connections
// In Next.js serverless environments it's important to cache the pool.
const getPool = () => {
  if (global.__pgPool) return global.__pgPool
  const options = {}
  if (connectionString) options.connectionString = connectionString
  // If you run into SSL issues, you can set `options.ssl = { rejectUnauthorized: false }`
  global.__pgPool = new Pool(options)
  return global.__pgPool
}

const pool = getPool()

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
