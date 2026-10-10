import { NextResponse } from "next/server";
import type { FieldErrors } from "@/lib/validation/issue";

/** A predictable JSON error envelope used across every API route. */
export function errorResponse(
  status: number,
  error: string,
  fieldErrors?: FieldErrors
) {
  return NextResponse.json(fieldErrors ? { error, fieldErrors } : { error }, {
    status,
  });
}
