import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Image } from "@/models/Image"
import { unlink } from "fs/promises"
import { join } from "path"
import { UPLOAD_DIR } from "@/lib/upload"
import { Types } from "mongoose"
import connectDB from "@/lib/mongodb"

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    }

    await connectDB()

    const image = await Image.findOne({
      _id: new Types.ObjectId(id),
      uploadedBy: session.user.id,
    })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Delete file from filesystem
    try {
      await unlink(join(UPLOAD_DIR, image.filename))
    } catch (error) {
      console.error("Error deleting file:", error)
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await Image.deleteOne({ _id: image._id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    )
  }
}