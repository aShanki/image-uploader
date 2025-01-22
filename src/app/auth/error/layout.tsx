import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Error - ImageUploader",
  description: "Authentication error",
}

export default function ErrorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}