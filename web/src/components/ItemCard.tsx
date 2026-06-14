import { Link } from 'react-router-dom'
import type { Item } from '../api/client'

interface Props {
  item: Item
  selected?: boolean
  onToggle?: (id: string) => void
}

export function ItemCard({ item, selected, onToggle }: Props) {
  return (
    <Link to={`/items/${item.id}`} className="cc-card" data-selected={selected || undefined}>
      <div className="cc-thumb">
        {onToggle && (
          <div
            className="cc-card__select"
            role="checkbox"
            aria-checked={!!selected}
            data-checked={selected || undefined}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(item.id) }}
          >
            <span className="cc-check__box" />
          </div>
        )}
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
