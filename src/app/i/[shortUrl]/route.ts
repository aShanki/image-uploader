import { NextResponse } from "next/server"
import { Image } from "@/models/Image"
import { join } from "path"
import { createReadStream } from "fs"
import { stat } from "fs/promises"
import connectDB from "@/lib/mongodb"
import { UPLOAD_DIR } from "@/lib/upload"

export async function GET(
  request: Request,
  { params }: { params: { shortUrl: string } }
) {
  try {
    await connectDB()

    // Find image by shortUrl
    const image = await Image.findOne({ shortUrl: params.shortUrl })
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Increment view count
    image.views += 1
    await image.save()

    // Get file path
    const filePath = join(UPLOAD_DIR, image.filename)

    // Check if file exists and get its stats
    try {
      const stats = await stat(filePath)
      const stream = createReadStream(filePath)

      // Create response with appropriate headers
      return new NextResponse(stream as unknown as BodyInit, {
        headers: {
          "Content-Type": image.mimeType,
          "Content-Length": stats.size.toString(),
          "Cache-Control": "public, max-age=31536000",
          "Content-Disposition": `inline; filename="${image.originalName}"`,
        },
      })
    } catch (error) {
      console.error("File read error:", error)
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("Error serving image:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}