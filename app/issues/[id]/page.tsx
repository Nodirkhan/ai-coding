import Link from "next/link";
import { Suspense } from "react";
import { IssueDetailsView } from "@/components/issues/issue-details-view";

type IssueDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default function IssueDetailsPage({ params }: IssueDetailsPageProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 px-6 py-12 font-sans">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Back to issues
      </Link>

      <Suspense
        fallback={
          <p role="status" aria-live="polite" className="text-sm text-zinc-500">
            Loading issue…
          </p>
        }
      >
        <IssueDetailsView params={params} />
      </Suspense>
    </div>
  );
}
