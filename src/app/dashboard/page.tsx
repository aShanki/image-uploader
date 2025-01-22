"use client"

import { useEffect, useState, useCallback } from "react"
import { ImageCard } from "@/components/dashboard/image-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ImageItem, ImagesResponse } from "@/types/dashboard"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  })
  
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get("page") || "1")
  const search = searchParams.get("search") || ""

  useEffect(() => {
    setSearchQuery(search)
    fetchImages(page, search)
  }, [page, search])

  const fetchImages = useCallback(async (page: number, search: string) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })
      if (search) params.append("search", search)

      const response = await fetch(`/api/images?${params}`)
      if (!response.ok) throw new Error("Failed to fetch images")
      
      const data: ImagesResponse = await response.json()
      setImages(data.images)
      setPagination(data.pagination)
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load images",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, pagination.limit, setIsLoading, setImages, setPagination])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append("search", searchQuery)
    router.push(`/dashboard${params.toString() ? `?${params}` : ""}`)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/images/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to delete image")
      
      setImages(current => current.filter(img => img.id !== id))
      toast({
        title: "Success",
        description: "Image deleted successfully",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete image",
      })
      throw new Error("Failed to delete image") // Re-throw for the ImageCard component to handle loading state
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Success",
        description: "URL copied to clipboard",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy URL",
      })
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Images</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : images.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onDelete={handleDelete}
                onCopyUrl={handleCopyUrl}
              />
            ))}
          </div>
          
          {pagination.pages > 1 && (
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/dashboard?page=${page - 1}${search ? `&search=${search}` : ""}`}
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href={`/dashboard?page=${pageNumber}${
                          search ? `&search=${search}` : ""
                        }`}
                        isActive={pageNumber === page}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                {page < pagination.pages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/dashboard?page=${page + 1}${search ? `&search=${search}` : ""}`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No images found</p>
        </div>
      )}
    </div>
  )
}