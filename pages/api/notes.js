// Minimal in-memory notes API for Next.js (demo only)
let notes = []
let nextId = 1

export default function handler(req, res) {
  const { method } = req

  if (method === 'GET') {
    res.status(200).json(notes)
    return
  }

  if (method === 'POST') {
    const { lng, lat, content } = req.body
    const note = { id: nextId++, lng, lat, content }
    notes.push(note)
    res.status(201).json(note)
    return
  }

  if (method === 'PUT') {
    const { id, lng, lat, content } = req.body
    const idx = notes.findIndex((n) => n.id === id)
    if (idx === -1) return res.status(404).json({ error: 'not found' })
    notes[idx] = { id, lng, lat, content }
    res.status(200).json(notes[idx])
    return
  }

  if (method === 'DELETE') {
    const { id } = req.query
    const idx = notes.findIndex((n) => n.id === Number(id))
    if (idx === -1) return res.status(404).json({ error: 'not found' })
    const removed = notes.splice(idx, 1)
    res.status(200).json(removed[0])
    return
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
