"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IssueForm } from "@/components/issues/issue-form";

type AppShellContextValue = {
  /** Increments whenever work items change outside the current page. */
  refreshKey: number;
  openCreateModal: () => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue {
  const value = useContext(AppShellContext);
  if (!value) {
    throw new Error("useAppShell must be used inside <AppShell>");
  }
  return value;
}

const NAV_LINKS = [
  { href: "/boards", label: "Boards" },
  { href: "/work-items", label: "Work Items" },
];

function CreateWorkItemDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="create-work-item-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-full max-w-lg rounded-md bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-4 p-5">
        <h2
          id="create-work-item-title"
          className="text-lg font-semibold text-zinc-900"
        >
          New work item
        </h2>
        <IssueForm onSuccess={onCreated} onCancel={onClose} />
      </div>
    </dialog>
  );
}

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Main" className="flex h-full items-stretch gap-1">
      {NAV_LINKS.map((link) => {
        const active = pathname?.startsWith(link.href) ?? false;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center border-b-2 px-3 text-sm font-medium hover:bg-white/10 ${
              active ? "border-white" : "border-transparent"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

/** Top menu bar, shared create modal, and refresh signalling for all pages. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  const openCreateModal = useCallback(() => setIsCreating(true), []);
  const value = useMemo(
    () => ({ refreshKey, openCreateModal }),
    [refreshKey, openCreateModal]
  );

  return (
    <AppShellContext.Provider value={value}>
      <header className="flex h-12 shrink-0 items-center gap-6 bg-[#0078d4] px-4 text-white">
        <Link href="/boards" className="text-base font-semibold">
          Trackly
        </Link>
        <Suspense fallback={<NavLinks pathname={null} />}>
          <ActiveNavLinks />
        </Suspense>
        <button
          type="button"
          onClick={openCreateModal}
          className="ml-auto rounded-sm bg-white px-3 py-1.5 text-sm font-medium text-[#0078d4] hover:bg-blue-50"
        >
          + New work item
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col bg-zinc-100">
        {children}
      </main>

      {isCreating && (
        <CreateWorkItemDialog
          onClose={() => setIsCreating(false)}
          onCreated={() => {
            setIsCreating(false);
            setRefreshKey((key) => key + 1);
          }}
        />
      )}
    </AppShellContext.Provider>
  );
}
