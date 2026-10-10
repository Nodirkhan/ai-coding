import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/http";
import { getIssueById } from "@/lib/services/issue-service";

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
