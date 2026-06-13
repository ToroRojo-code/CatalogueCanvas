import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/client'
import type { Portfolio } from '../api/client'

export function Portfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [title, setTitle] = useState('')

  const refresh = () => api.listPortfolios().then(setPortfolios)
  useEffect(() => { refresh() }, [])

  const create = async () => {
    if (!title.trim()) return
    await api.createPortfolio({ title: title.trim() })
    setTitle('')
    refresh()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this portfolio?')) return
    await api.deletePortfolio(id)
    refresh()
  }

  return (
    <div className="container">
      <div className="page-header"><h1>Portfolios</h1></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="New portfolio title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn" onClick={create}>Create</button>
      </div>
      {portfolios.length === 0 ? (
        <div className="empty-state">No portfolios yet.</div>
      ) : (
        portfolios.map((p) => (
          <div className="list-row" key={p.id}>
            <div>
              <div className="list-row-title">{p.title}</div>
              <div className="list-row-meta">
                /p/{p.slug} — {p.is_public ? 'public' : 'private'} — {p.item_ids.length} items
              </div>
            </div>
            <div className="row-actions">
              {p.is_public && <a className="btn" href={`/p/${p.slug}`} target="_blank" rel="noreferrer">View</a>}
              <Link className="btn" to={`/portfolios/${p.id}`}>Edit</Link>
              <button className="btn btn-danger" onClick={() => remove(p.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
