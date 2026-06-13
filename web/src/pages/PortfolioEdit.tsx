import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as api from '../api/client'
import type { Item, Portfolio } from '../api/client'

export function PortfolioEdit() {
  const { id } = useParams<{ id: string }>()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    api.getPortfolio(id).then(setPortfolio)
    api.listItems().then(setItems)
  }, [id])

  if (!portfolio) return <div className="container empty-state">Loading...</div>

  const toggleItem = (itemId: string) => {
    const item_ids = portfolio.item_ids.includes(itemId)
      ? portfolio.item_ids.filter((i) => i !== itemId)
      : [...portfolio.item_ids, itemId]
    setPortfolio({ ...portfolio, item_ids })
  }

  const save = async () => {
    setSaved(false)
    const updated = await api.updatePortfolio(portfolio.id, {
      title: portfolio.title,
      description: portfolio.description,
      slug: portfolio.slug,
      item_ids: portfolio.item_ids,
      is_public: portfolio.is_public,
    })
    setPortfolio(updated)
    setSaved(true)
  }

  const remove = async () => {
    if (!confirm('Delete this portfolio?')) return
    await api.deletePortfolio(portfolio.id)
    navigate('/portfolios')
  }

  const shareUrl = `${window.location.origin}/p/${portfolio.slug}`

  return (
    <div className="container">
      <div className="page-header">
        <h1>{portfolio.title}</h1>
        <button className="btn btn-danger" onClick={remove}>Delete</button>
      </div>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" value={portfolio.title} onChange={(e) => setPortfolio({ ...portfolio, title: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="slug">Slug</label>
        <input id="slug" value={portfolio.slug} onChange={(e) => setPortfolio({ ...portfolio, slug: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="description">Description (markdown)</label>
        <textarea id="description" rows={4} value={portfolio.description} onChange={(e) => setPortfolio({ ...portfolio, description: e.target.value })} />
      </div>
      <div className="field checkbox-row">
        <input
          id="public"
          type="checkbox"
          checked={portfolio.is_public}
          onChange={(e) => setPortfolio({ ...portfolio, is_public: e.target.checked })}
        />
        <label htmlFor="public" style={{ margin: 0, textTransform: 'none' }}>Public</label>
      </div>
      {portfolio.is_public && (
        <div className="field">
          <label>Share link</label>
          <div className="copy-link">{shareUrl}</div>
        </div>
      )}

      <label>Items ({portfolio.item_ids.length} selected)</label>
      <div className="item-checklist">
        {items.map((item) => (
          <label key={item.id}>
            {item.preview_url ? <img src={item.preview_url} alt={item.title} /> : <div className="work-card-thumb"><span className="no-preview">no preview</span></div>}
            <div className="checkbox-row">
              <input
                type="checkbox"
                checked={portfolio.item_ids.includes(item.id)}
                onChange={() => toggleItem(item.id)}
              />
              {item.title}
            </div>
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn" onClick={save}>Save</button>
        {saved && <span className="list-row-meta">Saved.</span>}
      </div>
    </div>
  )
}
