'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FaDiscord } from "react-icons/fa"

interface ErrorPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export function ErrorPage({ searchParams }: ErrorPageProps) {
  const error = searchParams?.error || "An unknown error occurred"
  
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "There was a problem logging in with Discord.",
    Default: "An unexpected error occurred while signing in.",
  }

  const errorMessage = errorMessages[error as string] || errorMessages.Default

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Authentication Error</CardTitle>
        <CardDescription>
          There was a problem signing in with Discord
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <Button asChild className="w-full flex items-center gap-2">
          <Link href="/">
            <FaDiscord className="w-5 h-5" />
            Try Again with Discord
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}