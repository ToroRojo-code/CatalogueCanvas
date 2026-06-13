import { useEffect, useState } from 'react'
import * as api from '../api/client'
import type { Collection, Item } from '../api/client'

export function MetadataForm({ item, onSaved }: { item: Item; onSaved: (item: Item) => void }) {
  const [title, setTitle] = useState(item.title)
  const [note, setNote] = useState(item.note)
  const [tags, setTags] = useState(item.tags.join(', '))
  const [collectionId, setCollectionId] = useState(item.collection_id ?? '')
  const [collections, setCollections] = useState<Collection[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.listCollections().then(setCollections).catch(() => {})
  }, [])

  useEffect(() => {
    setTitle(item.title)
    setNote(item.note)
    setTags(item.tags.join(', '))
    setCollectionId(item.collection_id ?? '')
  }, [item])

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api.updateItem(item.id, {
        title,
        note,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        collection_id: collectionId || null,
      })
      onSaved(updated)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="collection">Collection</label>
        <select id="collection" value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
          <option value="">None</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="note">Note (markdown)</label>
        <textarea id="note" rows={6} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <button className="btn" onClick={save} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
