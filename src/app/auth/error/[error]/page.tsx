import { ErrorPage } from "../error-page";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    error: string;
  };
}

export default function AuthErrorPage({ params }: PageProps) {
  if (!params.error) {
    redirect("/");
  }

  const searchParams = { error: params.error };

  return (
    <div className="container py-6">
      <ErrorPage searchParams={searchParams} />
    </div>
  );
}
