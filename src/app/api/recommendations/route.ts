import { NextRequest, NextResponse } from "next/server";
import { getProgramAreaForGoal } from "@/data/questionnaire";
import { getProgramsForArea } from "@/lib/online-programs";
import { UserResponses } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const responses: UserResponses = await request.json();

    if (!responses.studentGoal?.trim()) {
      return NextResponse.json(
        { error: "Please select what is stressing you out" },
        { status: 400 }
      );
    }

    const recommendations = getProgramsForArea(
      getProgramAreaForGoal(responses.studentGoal)
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
