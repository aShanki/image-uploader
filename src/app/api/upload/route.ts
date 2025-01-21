import { NextResponse } from "next/server"
import {
  initializeUploadDirectory,
  processAndSaveImage,
  saveToDatabase,
  validateUploadPermissions,
  MAX_FILE_SIZE,
} from "@/lib/upload"
import { LRUCache } from "lru-cache"

// Rate limiting setup
const rateLimit = new LRUCache({
  max: 500,
  ttl: 60 * 1000, // 1 minute
})

const getKey = (req: Request): string => {
  const ip = req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  return `upload:${ip}`
}

const rateLimiter = async (req: Request) => {
  const key = getKey(req)
  const requests = (rateLimit.get(key) as number) || 0

  if (requests > 10) {
    // More than 10 requests per minute
    return false
  }

  rateLimit.set(key, requests + 1)
  return true
}

export async function POST(req: Request) {
  try {
    // Check rate limit
    if (!(await rateLimiter(req))) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    // Validate authentication and permissions
    const user = await validateUploadPermissions()

    // Initialize upload directory
    await initializeUploadDirectory()

    // Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large" },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process and save the file
    const uploadResult = await processAndSaveImage(
      buffer,
      file.name,
      file.type
    )

    // Save to database
    const image = await saveToDatabase(uploadResult, user._id)

    // Return success response
    return NextResponse.json({
      success: true,
      file: {
        id: image._id,
        url: `${process.env.SITE_URL}/i/${image.shortUrl}`,
        deleteUrl: `${process.env.SITE_URL}/api/images/${image.shortUrl}/delete`,
        filename: image.filename,
        size: image.size,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}

// CORS headers for ShareX compatibility
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}