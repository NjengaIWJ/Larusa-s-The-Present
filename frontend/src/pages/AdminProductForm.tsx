import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createProduct,
  getProduct,
  updateProduct,
  uploadImage
} from '../api/requests'
import { useToast } from '../stores/useToast'

const ALLOWED_CATEGORIES = [
  'birthday',
  'anniversary',
  'thankyou',
  'holiday',
  'love',
  'general'
] as const

type Category = typeof ALLOWED_CATEGORIES[number]

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [name, setName] = useState<string>('')
  const [desc, setDesc] = useState<string>('')
  const [price, setPrice] = useState<number | ''>('')
  const [category, setCategory] = useState<Category>('general')
  const [images, setImages] = useState<{ url: string; publicId?: string }[]>([])

  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  // Load existing product if editing
  useEffect(() => {
    if (!id) return
    (async () => {
      try {
        const product = await getProduct(id)
        setName(product.name)
        setDesc(product.description ?? '')
        setPrice(product.price)
        setImages(product.images ?? [])
        if (product.category && ALLOWED_CATEGORIES.includes(product.category as Category)) {
          setCategory(product.category as Category)
        }
      } catch (error: unknown) {
        console.error('Failed to load product', error)
        showToast('Failed to load product')
      }
    })()
  }, [id, showToast])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Frontend validation for image type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid image type. Only JPEG, PNG, GIF, and WebP allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image too large (max 5MB).')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadImage(formData, (pct) => {
        setUploadProgress(pct)
      })
      // uploadImage now returns an object with url and metadata
      setImages((prev) => [...prev, { url: res.url }])
      showToast('Image uploaded successfully')
    } catch (error: unknown) {
      console.error('Upload image error', error)
      const apiError = error as ApiError
      if (apiError.response?.data?.message) {
        showToast(apiError.response.data.message)
      } else {
        showToast('Failed to upload image')
      }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [showToast])

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || price === '' || price < 0) {
      showToast('Please fill in all required fields')
      return
    }
    try {
      const payload = {
        name: name.trim(),
        description: desc.trim(),
        price: Number(price),
        images,
        category
      }
      if (id) {
        await updateProduct(id, payload)
        showToast('Product updated successfully')
      } else {
        await createProduct(payload)
        showToast('Product created successfully')
      }
      navigate('/admin/products')
    } catch (error: unknown) {
      console.error('Save product error', error)
      let msg = 'Save failed.'
      const apiError = error as ApiError
      if (apiError.response?.data?.message) {
        msg = apiError.response.data.message
      } else if (apiError.message) {
        msg = `Save failed: ${apiError.message}`
      }
      showToast(msg)
    }
  }, [id, name, desc, price, images, category, navigate, showToast])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {id ? 'Edit Product' : 'Create New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name*</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price*</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price === '' ? '' : price}
            onChange={(e) =>
              setPrice(e.target.value ? Number(e.target.value) : '')
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as Category)
            }
            className="w-full p-2 border rounded"
          >
            {ALLOWED_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Images</label>

          <div className="flex flex-wrap gap-4 mb-2">
            {images.map((img, index) => (
              <div key={img.url} className="relative group w-24 h-24">
                <img
                  src={img.url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="relative">
            <input
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              disabled={uploading}
              className="w-full p-2 border rounded"
            />
            {uploading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="text-sm">
                  Uploading… {uploadProgress}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {id ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminProductForm
