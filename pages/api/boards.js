const { query } = require('../../lib/db')

export default async function handler(req, res) {
  const { method } = req

  try {
    if (method === 'GET') {
      // return board fields needed by the map overlay (grid coords and posts_count)
      const result = await query('SELECT id, name, grid_x, grid_y, posts_count, center_lng, center_lat, meta FROM boards ORDER BY id')
      return res.status(200).json(result.rows)
    }

    if (method === 'POST') {
      const { name } = req.body
      const result = await query('INSERT INTO boards(name) VALUES($1) RETURNING id, name', [name || `board-${Date.now()}`])
      return res.status(201).json(result.rows[0])
    }

    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${method} Not Allowed`)
  } catch (err) {
    console.error('boards API error', err)
    res.status(500).json({ error: 'internal_error' })
  }
}
