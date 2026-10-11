"use client";

import { useRouter } from "next/navigation";

/** Goes back to the previous view (board or table), or the board if there is none. */
export function BackLink() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() =>
        window.history.length > 1 ? router.back() : router.push("/boards")
      }
      className="self-start text-sm text-[#0078d4] hover:underline"
    >
      ← Back
    </button>
  );
}
