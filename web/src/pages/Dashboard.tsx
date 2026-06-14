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
      <div className="cc-page-header">
        <div>
          <p className="cc-kicker">Catalog</p>
          <h1 className="cc-h1">Items<span className="cc-count">({items.length})</span></h1>
        </div>
        <div className="cc-search">
          <span className="cc-search__icon" />
          <input className="cc-input" placeholder="Search items..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      {loading ? (
        <div className="cc-empty">
          <p className="cc-empty__title">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="cc-empty">
          <p className="cc-empty__title">No items yet</p>
          <p className="cc-empty__sub">Add items from the Upload page.</p>
        </div>
      ) : (
        <div className="cc-grid">
          {filtered.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}
