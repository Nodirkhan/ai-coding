import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/http";
import {
  getIssueById,
  updateIssue,
  ValidationError,
} from "@/lib/services/issue-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const issueId = Number(id);

  if (!Number.isInteger(issueId)) {
    return errorResponse(404, "Issue not found");
  }

  try {
    const issue = getIssueById(issueId);
    if (!issue) {
      return errorResponse(404, "Issue not found");
    }
    return NextResponse.json(issue, { status: 200 });
  } catch (error) {
    console.error(`GET /api/issues/${id} failed`, error);
    return errorResponse(500, "Something went wrong. Please try again.");
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const issueId = Number(id);

  if (!Number.isInteger(issueId)) {
    return errorResponse(404, "Issue not found");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Request body must be valid JSON");
  }

  try {
    const issue = updateIssue(issueId, body);
    if (!issue) {
      return errorResponse(404, "Issue not found");
    }
    return NextResponse.json(issue, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return errorResponse(400, "Validation failed", error.fieldErrors);
    }
    console.error(`PUT /api/issues/${id} failed`, error);
    return errorResponse(500, "Something went wrong. Please try again.");
  }
}
