import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Board() {
  const router = useRouter()
  const { id } = router.query
  const [boards, setBoards] = useState([])
  const [name, setName] = useState('')

  useEffect(() => {
    fetch('/api/boards')
      .then((r) => r.json())
      .then(setBoards)
      .catch(() => setBoards([]))
  }, [])

  function createBoard(e) {
    e.preventDefault()
    fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
      .then((r) => r.json())
      .then((b) => {
        setBoards((s) => [...s, b])
        setName('')
      })
  }

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Board</h1>
      <form onSubmit={createBoard} style={{ marginBottom: 16 }}>
        <input placeholder="Board name" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit">Create</button>
      </form>

      <ul>
        {boards.map((b) => (
          <li key={b.id}>{b.name} (id: {b.id})</li>
        ))}
      </ul>

      <p>
        <a href="/">← Back</a>
      </p>
    </main>
  )
}
