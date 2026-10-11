import { Suspense } from "react";
import { IssueDetailsView } from "@/components/issues/issue-details-view";
import { BackLink } from "@/components/layout/back-link";

type IssueDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default function IssueDetailsPage({ params }: IssueDetailsPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 font-sans">
      <BackLink />

      <Suspense
        fallback={
          <p role="status" aria-live="polite" className="text-sm text-zinc-500">
            Loading work item…
          </p>
        }
      >
        <IssueDetailsView params={params} />
      </Suspense>
    </div>
  );
}
