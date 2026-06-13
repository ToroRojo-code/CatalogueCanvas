import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/client'
import type { Collection } from '../api/client'

export function Collections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [title, setTitle] = useState('')

  const refresh = () => api.listCollections().then(setCollections)
  useEffect(() => { refresh() }, [])

  const create = async () => {
    if (!title.trim()) return
    await api.createCollection({ title: title.trim() })
    setTitle('')
    refresh()
  }

  const remove = async (id: string) => {
    if (!confirm(`Delete collection "${id}"? Items will be unassigned.`)) return
    await api.deleteCollection(id)
    refresh()
  }

  return (
    <div className="container">
      <div className="page-header"><h1>Collections</h1></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="New collection title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn" onClick={create}>Create</button>
      </div>
      {collections.length === 0 ? (
        <div className="empty-state">No collections yet.</div>
      ) : (
        collections.map((c) => (
          <div className="list-row" key={c.id}>
            <div>
              <div className="list-row-title">{c.title}</div>
              <div className="list-row-meta">{c.id}</div>
            </div>
            <div className="row-actions">
              <Link className="btn" to={`/collections/${c.id}`}>Edit</Link>
              <button className="btn btn-danger" onClick={() => remove(c.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
