import { ErrorPage } from './error-page'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error",
  description: "Authentication error occurred",
};

interface PageSearchParams {
  error?: string;
}

export default function Page({ searchParams }: { searchParams: PageSearchParams }) {
  return (
    <div className="container py-6">
      <ErrorPage searchParams={searchParams} />
    </div>
  )
}
