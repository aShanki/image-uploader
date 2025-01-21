import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const siteUrl = process.env.SITE_URL
  if (!siteUrl) {
    return new NextResponse("Site URL not configured", { status: 500 })
  }

  // Generate ShareX configuration
  const config = {
    Version: "13.7.0",
    Name: "ImageUploader",
    DestinationType: "ImageUploader, FileUploader",
    RequestMethod: "POST",
    RequestURL: `${siteUrl}/api/upload`,
    Headers: {
      Authorization: `Bearer ${session.user.id}`,
    },
    Body: "MultipartFormData",
    FileFormName: "file",
    URL: "$json:file.url$",
    DeletionURL: "$json:file.deleteUrl$",
    ErrorMessage: "$json:error$",
  }

  // Send as downloadable file
  return new NextResponse(JSON.stringify(config, null, 2), {
    headers: {
      "Content-Disposition": "attachment; filename=ImageUploader.sxcu",
      "Content-Type": "application/octet-stream",
    },
  })
}