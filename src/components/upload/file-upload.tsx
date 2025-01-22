"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface UploadState {
  progress: number
  error?: string
  success?: boolean
}

interface FileWithPreview extends File {
  preview?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/x-matroska",
]

export function FileUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({})
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: file.type.startsWith("image/") 
          ? URL.createObjectURL(file)
          : undefined
      })
    )
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "video/*": [".mp4", ".mkv"],
    },
    maxSize: MAX_FILE_SIZE,
    validator: file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          code: "file-type",
          message: "File type not supported",
        }
      }
      return null
    },
  })

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      setUploadStates(prev => ({
        ...prev,
        [file.name]: { progress: 0 },
      }))

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const data = await response.json()

      setUploadStates(prev => ({
        ...prev,
        [file.name]: { progress: 100, success: true },
      }))

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully`,
      })

      // Copy URL to clipboard
      await navigator.clipboard.writeText(data.file.url)

      // Remove file from list after successful upload
      setFiles(prev => prev.filter(f => f !== file))
    } catch (error) {
      setUploadStates(prev => ({
        ...prev,
        [file.name]: {
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed",
        },
      }))
    }
  }

  const removeFile = (file: File) => {
    setFiles(prev => prev.filter(f => f !== file))
    if (file.name in uploadStates) {
      setUploadStates(prev => {
        const newState = { ...prev }
        delete newState[file.name]
        return newState
      })
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-8 w-8 text-gray-500" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Drop the files here"
              : "Drag & drop files here, or click to select"}
          </p>
          <p className="text-xs text-gray-500">
            Supported formats: JPG, PNG, GIF, MP4, MKV (max 10MB)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-4 p-2 border rounded"
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-12 w-12 object-cover rounded"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs">{file.type.split("/")[1]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                {uploadStates[file.name] && (
                  <div className="space-y-1">
                    <Progress value={uploadStates[file.name].progress} />
                    {uploadStates[file.name].error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {uploadStates[file.name].error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
              {!uploadStates[file.name]?.success ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => uploadFile(file)}
                    disabled={!!uploadStates[file.name]}
                  >
                    Upload
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFile(file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Check className="h-5 w-5 text-green-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}