const { query } = require('../../lib/db')

export default async function handler(req, res) {
  const { method } = req

  try {
    if (method === 'GET') {
      // return board fields needed by the map overlay (grid coords and posts_count)
      const result = await query('SELECT id, name, grid_x, grid_y, posts_count, center_lng, center_lat FROM boards ORDER BY id')
      // map to minimal public shape: id, name, x, y, lng, lat, count
      const rows = (result.rows || []).map(r => ({
        id: r.id,
        name: r.name,
        x: r.grid_x,
        y: r.grid_y,
        lng: r.center_lng,
        lat: r.center_lat,
        count: r.posts_count || 0
      }))
      return res.status(200).json(rows)
    }

    if (method === 'POST') {
      // accept optional grid and center fields so clients can create boards tied to a grid
      const { name, grid_x, grid_y, center_lng, center_lat, meta } = req.body || {}
      const insertSql = `INSERT INTO boards(name, grid_x, grid_y, center_lng, center_lat, meta)
        VALUES($1,$2,$3,$4,$5) RETURNING id, name, grid_x, grid_y, center_lng, center_lat, meta`
      const params = [name || `board-${Date.now()}`,
        grid_x != null ? Number(grid_x) : null,
        grid_y != null ? Number(grid_y) : null,
        center_lng != null ? Number(center_lng) : null,
        center_lat != null ? Number(center_lat) : null
      ]
      const result = await query(insertSql, params)
      return res.status(201).json(result.rows[0])
    }

    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${method} Not Allowed`)
  } catch (err) {
    console.error('boards API error', err)
    res.status(500).json({ error: 'internal_error' })
  }
}
