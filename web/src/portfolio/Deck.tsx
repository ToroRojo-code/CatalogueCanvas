import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../api/client'
import type { PublicPortfolio } from '../api/client'
import './deck.css'

export function Deck() {
  const { slug } = useParams<{ slug: string }>()
  const [portfolio, setPortfolio] = useState<PublicPortfolio | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    api.getPublicPortfolio(slug)
      .then(setPortfolio)
      .catch(() => setError('Portfolio not found.'))
  }, [slug])

  if (error) return <div className="deck"><section><div className="empty-state">{error}</div></section></div>
  if (!portfolio) return <div className="deck"><section /></div>

  const items = portfolio.items
  const total = items.length

  return (
    <div className="deck">
      <section className="cover">
        <div className="matte" />
        <div className="top">
          <span>Portfolio</span>
          <span>{total} works</span>
        </div>
        <div className="center">
          <h1>{portfolio.title}</h1>
          {portfolio.description && <p className="sub">{portfolio.description}</p>}
        </div>
        <div className="foot">
          <span className="name">CatalogCanvas</span>
          <span>/p/{portfolio.slug}</span>
        </div>
      </section>

      <section className="index">
        <div className="matte" />
        <div className="runhead">
          <span>Index</span>
          <span className="r">{total} works</span>
        </div>
        <hr className="rule" />
        <div className="head">
          <h2>Works</h2>
          <div className="meta">{portfolio.slug}</div>
        </div>
        <div className="grid">
          {items.map((item, i) => (
            <div className="cell" key={item.id}>
              <div className="thumb">
                {item.preview_url
                  ? <img src={item.preview_url} alt={item.title} />
                  : <span className="no-preview">no preview</span>}
              </div>
              <div className="cap">
                <span className="no">{String(i + 1).padStart(2, '0')}</span>
                <span className="id">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {items.map((item, i) => (
        <section className="art" key={item.id}>
          <div className="matte" />
          <div className="runhead">
            <span>Work {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            <span className="r">{portfolio.title}</span>
          </div>
          <hr className="rule" />
          <div className="body">
            <div className="plate-wrap">
              <div className="plate">
                {item.preview_url
                  ? <img src={item.preview_url} alt={item.title} />
                  : <span className="no-preview">no preview</span>}
              </div>
            </div>
            <div className="caption">
              <div className="kicker">Work {String(i + 1).padStart(2, '0')}</div>
              <h3><span className="u">{item.title}</span></h3>
              <div className="id">{item.id}</div>
              {item.note && <p className="desc">{item.note}</p>}
              {item.tags.length > 0 && (
                <dl className="specs">
                  <dt>Tags</dt>
                  <dd>{item.tags.join(', ')}</dd>
                </dl>
              )}
            </div>
          </div>
          <div className="artfoot">
            <span>{portfolio.slug}</span>
            <span>{String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          </div>
        </section>
      ))}

      <section className="colo">
        <div className="matte" />
        <div className="top">
          <span>Colophon</span>
          <span>CatalogCanvas</span>
        </div>
        <div className="main">
          <div>
            <h2>About this work</h2>
            {portfolio.description && <p>{portfolio.description}</p>}
            <p>A portfolio of {total} works shared via CatalogCanvas.</p>
          </div>
          <div className="works">
            <div className="wlbl">Works</div>
            <ol>
              {items.map((item, i) => (
                <li key={item.id}>
                  <span className="wn">{String(i + 1).padStart(2, '0')}</span>
                  <span className="wid">{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
