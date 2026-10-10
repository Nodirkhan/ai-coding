import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/http";
import { createIssue, getIssues, ValidationError } from "@/lib/services/issue-service";

export async function GET() {
  try {
    const issues = getIssues();
    return NextResponse.json(issues, { status: 200 });
  } catch (error) {
    console.error("GET /api/issues failed", error);
    return errorResponse(500, "Something went wrong. Please try again.");
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Request body must be valid JSON");
  }

  try {
    const issue = createIssue(body);
    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return errorResponse(400, "Validation failed", error.fieldErrors);
    }
    console.error("POST /api/issues failed", error);
    return errorResponse(500, "Something went wrong. Please try again.");
  }
}
