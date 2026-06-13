import { Link } from 'react-router-dom'
import type { Item } from '../api/client'

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link to={`/items/${item.id}`} className="work-card">
      <div className="work-card-thumb">
        {item.preview_url ? (
          <img src={item.preview_url} alt={item.title} loading="lazy" />
        ) : (
          <span className="no-preview">no preview</span>
        )}
      </div>
      <div className="work-card-body">
        <div className="work-card-title">{item.title}</div>
        <div className="work-card-meta">{item.id}</div>
        {item.tags.length > 0 && (
          <div className="work-card-tags">
            {item.tags.slice(0, 3).map((t) => (
              <span className="tag" key={t}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
