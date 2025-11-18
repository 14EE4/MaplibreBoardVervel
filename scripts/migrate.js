const fs = require('fs')
const path = require('path')
const { pool } = require('../lib/db')

async function run() {
  const migrationsPath = path.join(__dirname, '..', 'migrations', 'postgres_create_tables.sql')
  if (!fs.existsSync(migrationsPath)) {
    console.error('Migration file not found:', migrationsPath)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationsPath, 'utf8')

  // Split into statements to avoid issues with multiple statements
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(Boolean)

  const client = await pool.connect()
  try {
    for (const stmt of statements) {
      console.log('Applying:', stmt.split('\n')[0].slice(0, 120))
      await client.query(stmt)
    }
    console.log('Migrations applied successfully')
  } finally {
    client.release()
    // close pool so process can exit
    await pool.end()
  }
}

run().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
