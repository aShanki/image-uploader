import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import sharp from "sharp"
import { nanoid } from "nanoid"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { User } from "@/models/User"
import { Image } from "@/models/Image"

export const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads"
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760", 10) // 10MB
export const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || "").split(",")

export interface UploadResult {
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
}

export async function initializeUploadDirectory() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true })
  } catch (error) {
    console.error("Error creating upload directory:", error)
    throw new Error("Failed to create upload directory")
  }
}

export async function processAndSaveImage(
  file: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadResult> {
  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    throw new Error("File type not allowed")
  }

  const extension = mimeType.split("/")[1]
  const filename = `${nanoid()}.${extension}`
  const filePath = join(UPLOAD_DIR, filename)

  let width: number | undefined
  let height: number | undefined

  // Process image files with sharp
  if (mimeType.startsWith("image/")) {
    const image = sharp(file)
    const metadata = await image.metadata()
    width = metadata.width
    height = metadata.height

    // Optimize the image if it's not a GIF
    if (mimeType !== "image/gif") {
      await image
        .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(filePath)
    } else {
      await writeFile(filePath, file)
    }
  } else {
    // For non-image files (like videos), save directly
    await writeFile(filePath, file)
  }

  return {
    filename,
    originalName,
    mimeType,
    size: file.length,
    width,
    height,
  }
}

export async function saveToDatabase(
  uploadResult: UploadResult,
  userId: string
) {
  try {
    // Create image record
    const image = await Image.create({
      ...uploadResult,
      uploadedBy: userId,
    })

    // Update user's upload count
    await User.findByIdAndUpdate(userId, {
      $inc: { uploadCount: 1 },
    })

    return image
  } catch (error) {
    console.error("Error saving to database:", error)
    throw new Error("Failed to save file information")
  }
}

export async function validateUploadPermissions() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  const user = await User.findOne({ email: session.user.email })
  if (!user) {
    throw new Error("User not found")
  }

  // Add any additional permission checks here
  // For example, checking upload limits, quotas, etc.

  return user
}