'use client'

import { useState } from 'react'
import { ImageMetadata } from '@/types/image'
import Image from 'next/image'

interface ImageGridProps {
  images: ImageMetadata[]
  onDelete: (id: string) => Promise<void>
}

export default function ImageGrid({ images, onDelete }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedImages = [...images].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const copyImageUrl = async (url: string) => {
    const fullUrl = `${window.location.origin}${url}`
    await navigator.clipboard.writeText(fullUrl)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Images</h2>
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Sort by Date {sortOrder === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedImages.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative aspect-video">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${image.url}`}
                alt={image.filename}
                fill
                className="object-cover cursor-pointer"
                onClick={() => setSelectedImage(image)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-4 space-y-2">
              <p className="font-medium truncate" title={image.filename}>
                {image.filename}
              </p>
              <div className="text-sm text-gray-500">
                <p>Size: {formatFileSize(image.size)}</p>
                <p>Uploaded: {formatDate(image.createdAt)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyImageUrl(image.url)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => onDelete(image.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full h-[80vh]">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${selectedImage.url}`}
              alt={selectedImage.filename}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  )
}