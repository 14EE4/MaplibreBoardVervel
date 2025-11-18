// Minimal in-memory boards API for Next.js (demo only)
let boards = [ { id: 1, name: 'default' } ]
let nextBoardId = 2

export default function handler(req, res) {
  const { method } = req

  if (method === 'GET') {
    res.status(200).json(boards)
    return
  }

  if (method === 'POST') {
    const { name } = req.body
    const board = { id: nextBoardId++, name: name || `board-${Date.now()}` }
    boards.push(board)
    res.status(201).json(board)
    return
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
