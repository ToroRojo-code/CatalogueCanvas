import { Uploader } from '../components/Uploader'

export function Upload() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Upload</h1>
      </div>
      <Uploader onUploaded={() => {}} />
    </div>
  )
}
