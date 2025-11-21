import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Admin() {
  const [boards, setBoards] = useState([])

  useEffect(() => {
    fetch('/api/boards')
      .then((r) => r.json())
      .then(setBoards)
      .catch(() => setBoards([]))
  }, [])

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Maplibre Board (Admin)</h1>
      <p>This is the admin UI for MaplibreBoard.</p>

      <section>
        <h2>Boards</h2>
        <ul>
          {boards.map((b) => (
            <li key={b.id}>
              <Link href={`/board?id=${b.id}`}>{b.name}</Link>
            </li>
          ))}
        </ul>
        <p>
          <Link href="/board">Create / open board</Link>
        </p>
        <p>
          <Link href="/index.html">퍼블릭 인덱스 페이지 보기</Link>
        </p>
      </section>
    </main>
  )
}
