import { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}