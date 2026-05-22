import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "@/lib/auth";
import { saveGroup, getGroups, deleteGroup } from "@/lib/firestore";
import { calcMatchPlayResult } from "@/lib/scoring";
import { GroupResult } from "@/lib/scoring";

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

  const matchResult = calcMatchPlayResult(team1Holes, team2Holes);

  const group: GroupResult = {
    groupId,
    roundSlug,
    format,
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
