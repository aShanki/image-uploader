"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { FaDiscord } from "react-icons/fa"

export default function Home() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>ImageUploader</CardTitle>
          <CardDescription>
            A private image hosting service for your Discord community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full flex items-center gap-2"
            size="lg"
            onClick={() => signIn("discord")}
          >
            <FaDiscord className="w-5 h-5" />
            Sign in with Discord
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
