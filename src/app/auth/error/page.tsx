import { ErrorPage } from './error-page'

interface SearchParams {
  error?: string
}

interface Props {
  params: Record<string, string>
  searchParams: SearchParams
}

// @ts-expect-error Async Server Component typing issues
export default async function AuthErrorPage({ searchParams }: Props) {
  return (
    <div className="container py-6">
      <ErrorPage searchParams={searchParams} />
    </div>
  )
}
