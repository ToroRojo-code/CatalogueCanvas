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
      <div className="cc-page-header">
        <div>
          <p className="cc-kicker">Organize</p>
          <h1 className="cc-h1">Collections<span className="cc-count">({collections.length})</span></h1>
        </div>
      </div>
      <div className="cc-createbar">
        <input className="cc-input" placeholder="New collection title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="cc-btn cc-btn--primary" onClick={create}>Create</button>
      </div>
      {collections.length === 0 ? (
        <div className="cc-empty">
          <p className="cc-empty__title">No collections yet</p>
        </div>
      ) : (
        <div className="cc-list">
          {collections.map((c) => (
            <div className="cc-row" key={c.id}>
              <div className="cc-row__main">
                <h3 className="cc-row__title">{c.title}</h3>
                <div className="cc-row__meta"><span>{c.id}</span></div>
              </div>
              <div className="cc-row__actions">
                <Link className="cc-btn cc-btn--sm" to={`/collections/${c.id}`}>Edit</Link>
                <button className="cc-btn cc-btn--danger cc-btn--sm" onClick={() => remove(c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
