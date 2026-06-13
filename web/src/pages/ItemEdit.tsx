import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as api from '../api/client'
import type { Item, DescribeResult } from '../api/client'
import { LLMButton } from '../components/LLMButton'
import { MetadataForm } from '../components/MetadataForm'

export function ItemEdit() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<Item | null>(null)
  const [llmResult, setLlmResult] = useState<DescribeResult | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (id) api.getItem(id).then(setItem)
  }, [id])

  if (!item) return <div className="container empty-state">Loading...</div>

  const applyDescription = async () => {
    if (!llmResult) return
    const note = [llmResult.summary, '', ...llmResult.descriptions.map((d) => `- ${d}`)].join('\n')
    const updated = await api.updateItem(item.id, { note })
    setItem(updated)
    setLlmResult(null)
  }

  const remove = async () => {
    if (!confirm(`Delete item ${item.id}? This cannot be undone.`)) return
    await api.deleteItem(item.id)
    navigate('/')
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>{item.title}</h1>
        <button className="btn btn-danger" onClick={remove}>Delete</button>
      </div>
      <div className="edit-hero">
        <div className="edit-image">
          {item.preview_url ? <img src={item.preview_url} alt={item.title} /> : <div className="empty-state">no preview</div>}
        </div>
        <div className="edit-panel">
          <div className="list-row-meta">ID: {item.id}</div>
          {item.download_urls.length > 0 && (
            <div>
              <label>Files</label>
              <div className="download-links">
                {item.download_urls.map((d) => (
                  d.type === 'other'
                    ? <a key={d.url} className="btn" href={d.url} download>{d.name}</a>
                    : <a key={d.url} className="btn" href={d.url} target="_blank" rel="noreferrer">{d.name}</a>
                ))}
              </div>
              <div className="image-previews">
                {item.download_urls.filter((d) => d.type === 'image').map((d) => (
                  <a key={d.url} href={d.url} target="_blank" rel="noreferrer">
                    <img src={d.url} alt={d.name} className="file-thumb" />
                  </a>
                ))}
              </div>
            </div>
          )}
          <a className="btn" href={api.itemArchiveUrl(item.id)} download>Download all as ZIP</a>
          <MetadataForm item={item} onSaved={setItem} />
          <LLMButton itemId={item.id} onResult={setLlmResult} />
          {llmResult && (
            <div className="field" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
              <strong>Summary:</strong> {llmResult.summary}
              <ul>
                {llmResult.descriptions.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
              <button className="btn" onClick={applyDescription} type="button">Apply to note</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
