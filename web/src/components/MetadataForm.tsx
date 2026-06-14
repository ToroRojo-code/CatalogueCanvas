import { useEffect, useState } from 'react'
import * as api from '../api/client'
import type { Collection, Item } from '../api/client'

export function MetadataForm({ item, onSaved }: { item: Item; onSaved: (item: Item) => void }) {
  const [title, setTitle] = useState(item.title)
  const [tags, setTags] = useState(item.tags.join(', '))
  const [collectionId, setCollectionId] = useState(item.collection_id ?? '')
  const [collections, setCollections] = useState<Collection[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.listCollections().then(setCollections).catch(() => {})
  }, [])

  useEffect(() => {
    setTitle(item.title)
    setTags(item.tags.join(', '))
    setCollectionId(item.collection_id ?? '')
  }, [item])

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api.updateItem(item.id, {
        title,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        collection_id: collectionId || null,
      })
      onSaved(updated)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="cc-form">
      <div className="cc-field">
        <label className="cc-label" htmlFor="title">Title</label>
        <input id="title" className="cc-input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="cc-field">
        <label className="cc-label" htmlFor="tags">Tags (comma separated)</label>
        <input id="tags" className="cc-input" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>
      <div className="cc-field">
        <label className="cc-label" htmlFor="collection">Collection</label>
        <select id="collection" className="cc-select" value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
          <option value="">None</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>
      <button className="cc-btn cc-btn--primary" onClick={save} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
