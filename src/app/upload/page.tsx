import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/upload/file-upload"

export const metadata: Metadata = {
  title: "Upload - ImageUploader",
  description: "Upload your images securely",
}

export default function UploadPage() {
  return (
    <div className="container max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop files or click to select
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload />
        </CardContent>
      </Card>
    </div>
  )
}