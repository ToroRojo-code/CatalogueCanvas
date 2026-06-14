import { Link } from 'react-router-dom'
import type { Item } from '../api/client'

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link to={`/items/${item.id}`} className="cc-card">
      <div className="cc-thumb">
        {item.preview_url ? (
          <img src={item.preview_url} alt={item.title} loading="lazy" />
        ) : (
          <span className="cc-thumb__label">no preview</span>
        )}
      </div>
      <div className="cc-card__body">
        <h3 className="cc-card__title">{item.title}</h3>
        <div className="cc-card__id">{item.id}</div>
        {item.tags.length > 0 && (
          <div className="cc-card__tags">
            {item.tags.slice(0, 3).map((t) => (
              <span className="cc-tag" key={t}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
