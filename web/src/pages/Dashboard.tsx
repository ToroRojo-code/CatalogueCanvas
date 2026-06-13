import { useCallback, useEffect, useState } from 'react'
import * as api from '../api/client'
import type { Item } from '../api/client'
import { ItemCard } from '../components/ItemCard'

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const refresh = useCallback(() => {
    api.listItems().then(setItems).finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const filtered = items.filter((i) => {
    const q = query.toLowerCase()
    return !q || i.title.toLowerCase().includes(q) || i.id.includes(q) || i.tags.some((t) => t.toLowerCase().includes(q))
  })

  return (
    <div className="container">
      <div className="page-header">
        <h1>Items ({items.length})</h1>
      </div>
      <div className="field" style={{ marginTop: 16 }}>
        <input placeholder="Search items..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No items yet. Upload a ZIP to get started.</div>
      ) : (
        <div className="works-grid">
          {filtered.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}
