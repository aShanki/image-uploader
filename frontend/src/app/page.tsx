'use client'

import { useEffect, useState } from 'react'
import { ImageMetadata } from '@/types/image'
import ImageGrid from '@/components/ImageGrid'
import ImageUpload from '@/components/ImageUpload'

export default function Home() {
  const [images, setImages] = useState<ImageMetadata[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images`)
      if (!response.ok) throw new Error('Failed to fetch images')
      const data = await response.json()
      setImages(data)
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (image: ImageMetadata) => {
    setImages((prev) => [image, ...prev])
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/images/${id}`,
        {
          method: 'DELETE',
        }
      )
      if (!response.ok) throw new Error('Failed to delete image')
      setImages((prev) => prev.filter((img) => img.id !== id))
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Image Uploader</h1>
      
      <div className="mb-8">
        <ImageUpload onUploadComplete={handleUploadComplete} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      ) : images.length > 0 ? (
        <ImageGrid images={images} onDelete={handleDelete} />
      ) : (
        <div className="text-center text-gray-500 py-12">
          No images uploaded yet
        </div>
      )}
    </main>
  )
}
