import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as api from '../api/client'
import type { Collection, Item } from '../api/client'
import { ItemCard } from '../components/ItemCard'

export function CollectionEdit() {
  const { id } = useParams<{ id: string }>()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    api.getCollection(id).then(setCollection)
    api.listItems().then((all) => setItems(all.filter((i) => i.collection_id === id)))
  }, [id])

  if (!collection) return <div className="container empty-state">Loading...</div>

  const save = async () => {
    const updated = await api.updateCollection(collection.id, {
      title: collection.title,
      description: collection.description,
    })
    setCollection(updated)
  }

  const remove = async () => {
    if (!confirm(`Delete collection "${collection.id}"?`)) return
    await api.deleteCollection(collection.id)
    navigate('/collections')
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>{collection.title}</h1>
        <button className="btn btn-danger" onClick={remove}>Delete</button>
      </div>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" value={collection.title} onChange={(e) => setCollection({ ...collection, title: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="description">Description (markdown)</label>
        <textarea id="description" rows={4} value={collection.description} onChange={(e) => setCollection({ ...collection, description: e.target.value })} />
      </div>
      <button className="btn" onClick={save}>Save</button>

      <div className="page-header"><h1>Items ({items.length})</h1></div>
      {items.length === 0 ? (
        <div className="empty-state">No items in this collection. Assign items from their edit page.</div>
      ) : (
        <div className="works-grid">
          {items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}
