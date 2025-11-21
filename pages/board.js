import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Board() {
  const router = useRouter()
  const { id, grid_x, grid_y } = router.query

  const [resolvedBoardId, setResolvedBoardId] = useState(null)
  const [metaText, setMetaText] = useState('로드 중...')
  const [posts, setPosts] = useState([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [postPassword, setPostPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState({}) // { postId: { editing: true, value: '...' } }

  const escapeHtml = (str) => {
    if (!str) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    try { return new Date(ts).toLocaleString() } catch (e) { return ts }
  }

  const loadPosts = useCallback(async (boardId) => {
    if (!boardId) return
    setLoading(true)
    try {
      // use centralized posts API which accepts a board_id query param
      const res = await fetch(`/api/posts?board_id=${encodeURIComponent(boardId)}`)
      const list = await res.json()
      setPosts(Array.isArray(list) ? list : [])
      setMetaText('')
    } catch (err) {
      console.error('posts fetch failed', err)
      setMetaText('게시글을 불러오지 못했습니다. 콘솔 확인')
    } finally { setLoading(false) }
  }, [])

  const loadBoardById = useCallback((boardId) => {
    setResolvedBoardId(boardId)
    setMetaText('')
    loadPosts(boardId)
  }, [loadPosts])

  const loadBoardByGrid = useCallback(async (gx, gy) => {
    setMetaText('격자 보드 조회 중...')
    try {
      const res = await fetch('/api/boards')
      const list = await res.json()
      const found = Array.isArray(list) ? list.find(b => b.grid_x === Number(gx) && b.grid_y === Number(gy)) : null
      if (found) {
        setResolvedBoardId(found.id)
        setMetaText(`grid: ${gx},${gy}`)
        loadPosts(found.id)
      } else {
        setMetaText(`해당 격자의 게시판을 찾을 수 없습니다 (grid:${gx},${gy}).`)
      }
    } catch (err) {
      console.error('boards fetch failed', err)
      setMetaText('보드 목록을 불러오지 못했습니다. 콘솔 확인')
    }
  }, [loadPosts])

  useEffect(() => {
    // entry: on query change
    if (id) loadBoardById(id)
    else if (grid_x != null && grid_y != null) loadBoardByGrid(grid_x, grid_y)
    else setMetaText('URL에 ?id=BOARD_ID 또는 ?grid_x=NUM&grid_y=NUM 를 추가하세요.')
  }, [id, grid_x, grid_y, loadBoardById, loadBoardByGrid])

  async function submitPost() {
    if (!resolvedBoardId) { alert('게시판이 선택되지 않았습니다. URL에 id 또는 grid_x/grid_y를 지정하세요.'); return }
    const authorVal = (author || null)
    const contentVal = (content || '').trim()
    const pw = (postPassword || '').trim()
    if (!contentVal) { alert('내용을 입력하세요.'); return }
    const payload = { author: authorVal, content: contentVal }
    if (pw) payload.password = pw

    setLoading(true)
    try {
      // use central posts API: provide board_id in body
      const fullPayload = { ...payload, board_id: Number(resolvedBoardId) }
      const res = await fetch(`/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
      })

      const text = await res.text()
      let body = null
      try { body = text ? JSON.parse(text) : null } catch (e) { body = { error: text } }

      if (!res.ok) {
        console.error('post failed', res.status, body)
        const msg = (body && body.error) ? `작성 실패: ${body.error}` : `작성 실패 (HTTP ${res.status})`
        alert(msg)
        return
      }

      // 성공 처리
      console.log('post success', body)
      setContent('')
      setPostPassword('')
      loadPosts(resolvedBoardId)
    } catch (err) {
      console.error('post failed', err)
      alert('작성 실패. 콘솔을 확인하세요.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyAndEdit(postId) {
    const pw = (document.getElementById(`pwd-${postId}`)?.value || '').trim()
    if (!pw) { alert('수정을 위해 비밀번호를 입력하세요.'); return }
    try {
      const res = await fetch(`/api/posts/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: postId, password: pw }) })
      if (!res.ok) {
        const j = await res.json().catch(()=>({})); throw j
      }
      // enter edit mode
      const post = posts.find(p=>p.id===postId)
      setEditing(e => ({ ...e, [postId]: { editing: true, value: post ? (post.content||'') : '' } }))
    } catch (err) { console.error('verify failed', err); alert((err && err.error) ? err.error : '비밀번호가 일치하지 않습니다.') }
  }

  async function saveEdit(postId) {
    const pw = (document.getElementById(`pwd-${postId}`)?.value || '').trim()
    if (!pw) { alert('수정을 위해 비밀번호를 입력하세요.'); return }
    const newContent = (editing[postId] && editing[postId].value || '').trim()
    if (!newContent) { alert('내용을 입력하세요.'); return }
    try {
      const res = await fetch(`/api/posts`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: postId, password: pw, content: newContent, author: (author || null) }) })
      if (!res.ok) {
        const j = await res.json().catch(()=>({})); throw j
      }
      setEditing(e => { const copy = { ...e }; delete copy[postId]; return copy })
      loadPosts(resolvedBoardId)
    } catch (err) { console.error('update failed', err); alert((err && err.error) ? err.error : '수정 실패(비밀번호 확인)') }
  }

  async function deletePost(postId) {
    const pw = (document.getElementById(`pwd-${postId}`)?.value || '').trim()
    if (!pw) { alert('삭제를 위해 비밀번호를 입력하세요.'); return }
    if (!confirm('정말로 삭제하시겠습니까?')) return
    try {
      const res = await fetch(`/api/posts?id=${encodeURIComponent(postId)}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) })
      if (!res.ok) {
        const j = await res.json().catch(()=>({})); throw j
      }
      loadPosts(resolvedBoardId)
    } catch (err) { console.error('delete failed', err); alert((err && err.error) ? err.error : '삭제 실패(비밀번호 확인)') }
  }

  return (
    <main style={{ padding: 16, fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <Head>
        <title>게시판</title>
      </Head>
      <h1 id="title">게시판</h1>
      <div id="boardMeta" style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>{metaText}</div>

      <div style={{ background: '#fffbdd', border: '1px solid #ffe58f', padding: 8, borderRadius: 4, marginBottom: 12 }}>
        이 페이지는 클라이언트에서 보드 ID 또는 격자 좌표로 게시글을 불러옵니다.
        URL 예시: <code>/boards?id=123</code> 또는 <code>/boards?grid_x=0&grid_y=0</code>
      </div>

      <section id="newPost">
        <h3>새 글 작성</h3>
        <input id="author" placeholder="작성자 (선택)" style={{ width: '100%', padding: 6, boxSizing: 'border-box', marginBottom: 6 }} value={author} onChange={e=>setAuthor(e.target.value)} />
        <textarea id="content" placeholder="내용을 입력하세요..." style={{ width: '100%', height: 100 }} value={content} onChange={e=>setContent(e.target.value)} onKeyDown={e=>{ if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); submitPost(); } }} />
        <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input id="postPassword" placeholder="4자리 비밀번호 (선택)" maxLength={4} style={{ width: 180, padding: 6, boxSizing: 'border-box' }} value={postPassword} onChange={e=>setPostPassword(e.target.value)} onKeyDown={e=>{ if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); submitPost(); } }} />
          <small style={{ color: '#666' }}>* 비밀번호를 설정하면 해당 비밀번호로 수정/삭제 가능</small>
        </div>
        <div style={{ marginTop: 8 }}>
          <button id="submitPost" onClick={submitPost}>전송</button>
          <span style={{ marginLeft: 8, color: '#666', fontSize: 12 }}>Ctrl+Enter로 전송</span>
        </div>
      </section>

      <div id="posts" style={{ marginTop: 12 }}>
        {loading && <div className="meta">로딩 중...</div>}
        {!loading && (!posts || posts.length === 0) && <div className="meta">게시글이 없습니다.</div>}
        {posts.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6, marginBottom: 8 }}>
            <div dangerouslySetInnerHTML={{ __html: (p.author ? `<strong>${escapeHtml(p.author)}</strong>` : '<strong>익명</strong>') + ' <span style="color:#888;font-size:12px">' + (p.createdAt ? formatTime(p.createdAt) : '') + '</span>' }} />
            <div style={{ marginTop: 6 }}>
              {editing[p.id] && editing[p.id].editing ? (
                <textarea style={{ width: '100%', height: 120 }} value={editing[p.id].value} onChange={ev=>setEditing(prev=>({ ...prev, [p.id]: { editing: true, value: ev.target.value } }))} onKeyDown={ev=>{ if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); saveEdit(p.id); } }} />
              ) : (
                <div className="post-content" dangerouslySetInnerHTML={{ __html: escapeHtml(p.content || '').replace(/\n/g, '<br>') }} />
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <input id={`pwd-${p.id}`} type="password" placeholder="비밀번호" maxLength={4} style={{ marginRight: 8, padding: 6, width: 120 }} onKeyDown={ev=>{ if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); if (editing[p.id] && editing[p.id].editing) { saveEdit(p.id); } else { verifyAndEdit(p.id); } } }} />
              {editing[p.id] && editing[p.id].editing ? (
                <>
                  <button onClick={()=>saveEdit(p.id)}>저장</button>
                  <button onClick={()=>setEditing(e=>{ const c={...e}; delete c[p.id]; return c })} style={{ marginLeft: 6 }}>취소</button>
                </>
              ) : (
                <>
                  <button onClick={()=>verifyAndEdit(p.id)} style={{ marginRight: 6 }}>수정</button>
                  <button onClick={()=>deletePost(p.id)}>삭제</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <p><a href="/">← Back</a></p>
    </main>
  )
}
