import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "@/lib/auth";
import { saveGroup, getGroups, deleteGroup } from "@/lib/firestore";
import { calcGroupResult } from "@/lib/scoring";
import { GroupResult } from "@/lib/scoring";
import { PLAYERS } from "@/data/players";
import { getCourse } from "@/data/courses";

export async function GET(req: NextRequest) {
  const roundSlug = req.nextUrl.searchParams.get("round") ?? undefined;
  const groups = await getGroups(roundSlug);
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || !isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { groupId, roundSlug, format, team1, team2, team1Holes, team2Holes } = body;
  const scoring: "gross" | "net" = body.scoring === "net" ? "net" : "gross";

  const holeInfos = getCourse(roundSlug)?.holes ?? [];
  const matchResult = calcGroupResult(
    { scoring, team1, team2, team1Holes, team2Holes },
    PLAYERS,
    holeInfos
  );

  const group: GroupResult = {
    groupId,
    roundSlug,
    format,
    scoring,
    team1,
    team2,
    team1Holes,
    team2Holes,
    result: {
      winner: matchResult.winner,
      team1Points: matchResult.team1Points,
      team2Points: matchResult.team2Points,
    },
  };

  await saveGroup(group);
  return NextResponse.json({ ok: true, result: matchResult });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || !isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { groupId } = await req.json();
  await deleteGroup(groupId);
  return NextResponse.json({ ok: true });
}
