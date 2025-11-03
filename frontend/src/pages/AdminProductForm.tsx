import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createProduct, getProduct, updateProduct, uploadImage } from '../api/requests'

const AdminProductForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (id) {
      getProduct(id).then(p => { setName(p.name); setDesc(p.description || ''); setPrice(p.price); setImages(p.images || []) }).catch(() => {})
    }
  }, [id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = { name, description: desc, price: Number(price), images, category: 'general' }
      if (id) await updateProduct(id, payload)
      else await createProduct(payload)
      navigate('/admin/products')
    } catch (err: unknown) { alert(`Save failed: ${String(err)}`) }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      setUploading(true)
      setUploadProgress(0)
      const res = await uploadImage(f, (pct) => setUploadProgress(pct))
      if (res && res.url) setImages((s) => [...s, res.url])
    } catch { alert('Upload failed') }
    finally { setUploading(false); setUploadProgress(0) }
  }

  function removeImage(url: string) {
    setImages(s => s.filter(u => u !== url))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{id ? 'Edit' : 'Create'} Product</h2>
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1 block w-full border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium">Price</label>
          <input type="number" value={price === '' ? '' : price} onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} className="mt-1 block w-44 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-900" />
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium">Images</label>
          <div className="mt-2 flex items-center gap-3">
            <input type="file" onChange={onFile} className="" />
            {uploading && <div className="text-sm text-gray-500">Uploading {uploadProgress}%</div>}
          </div>
          <div className="mt-3 flex items-center gap-3">
            {images.map((u) => (
              <div key={u} className="relative">
                <img src={u} className="w-28 h-20 object-cover rounded-md" />
                <button type="button" onClick={() => removeImage(u)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs">×</button>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" className="btn-cta">Save</button>
        </div>
      </form>
    </div>
  )
}

export default AdminProductForm
