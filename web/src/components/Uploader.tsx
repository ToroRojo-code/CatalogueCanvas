import { useRef, useState, type DragEvent } from 'react'
import { uploadItem, ApiError } from '../api/client'

export function Uploader({ onUploaded }: { onUploaded: () => void }) {
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.zip')) continue
      setStatus(`uploading ${file.name}...`)
      try {
        const res = await uploadItem(file)
        setStatus(res.created ? `✓ ${file.name} → ${res.item?.id}` : `skipped ${file.name} (${res.note})`)
      } catch (err) {
        setStatus(err instanceof ApiError ? `error: ${err.message}` : 'upload failed')
      }
    }
    onUploaded()
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      className={`dropzone${dragOver ? ' dragover' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {status || 'Drop ZIP files here or click to upload'}
    </div>
  )
}
