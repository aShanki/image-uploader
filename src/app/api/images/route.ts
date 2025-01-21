import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Image } from "@/models/Image"
import { Types } from "mongoose"
import connectDB from "@/lib/mongodb"

interface ImageQuery {
  uploadedBy: Types.ObjectId;
  $or?: Array<{
    originalName?: { $regex: string; $options: string };
    shortUrl?: { $regex: string; $options: string };
  }>;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    const query: ImageQuery = {
      uploadedBy: new Types.ObjectId(session.user.id),
    }

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: "i" } },
        { shortUrl: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [images, total] = await Promise.all([
      Image.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Image.countDocuments(query),
    ])

    // Transform the data for the client
    const transformedImages = images.map(image => ({
      id: image._id.toString(),
      filename: image.filename,
      originalName: image.originalName,
      shortUrl: image.shortUrl,
      mimeType: image.mimeType,
      size: image.size,
      width: image.width,
      height: image.height,
      views: image.views,
      createdAt: image.createdAt,
      url: `${process.env.SITE_URL}/i/${image.shortUrl}`,
      deleteUrl: `${process.env.SITE_URL}/api/images/${image.shortUrl}/delete`,
    }))

    return NextResponse.json({
      images: transformedImages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    )
  }
}