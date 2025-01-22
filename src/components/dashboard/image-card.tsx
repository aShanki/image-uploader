"use client"

import { ImageCardProps } from "@/types/dashboard"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Link, MoreVertical, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { formatDistance } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export function ImageCard({ image, onDelete, onCopyUrl }: ImageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (isDeleting) return

    try {
      setIsDeleting(true)
      await onDelete(image.id)
      toast({
        title: "Image deleted",
        description: "The image has been removed successfully",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete image",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"]
    if (bytes === 0) return "0 B"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {image.mimeType.startsWith("image/") ? (
          <div className="aspect-square relative group">
            <img
              src={image.url}
              alt={image.originalName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onCopyUrl(image.url)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.open(image.url, "_blank")}
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="aspect-square flex items-center justify-center bg-muted">
            <span className="text-2xl font-bold text-muted-foreground">
              {image.mimeType.split("/")[1].toUpperCase()}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-2 flex items-center justify-between">
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate" title={image.originalName}>
            {image.originalName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(image.size)} •{" "}
            {formatDistance(new Date(image.createdAt), new Date(), {
              addSuffix: true,
            })}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCopyUrl(image.url)}>
              <Copy className="h-4 w-4 mr-2" /> Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyUrl(image.shortUrl)}>
              <Link className="h-4 w-4 mr-2" /> Copy Short URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}