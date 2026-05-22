import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "@/lib/auth";
import { saveIndividualScore, getIndividualScores, deleteIndividualScore } from "@/lib/firestore";
import { PLAYERS } from "@/data/players";
import { getCourse } from "@/data/courses";
import { calcGrossTotal, calcNetScore } from "@/lib/scoring";

export async function GET(req: NextRequest) {
  const roundSlug = req.nextUrl.searchParams.get("round") ?? undefined;
  const scores = await getIndividualScores(roundSlug);
  return NextResponse.json(scores);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || !isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { playerId, roundSlug, holes } = await req.json();

  const player = PLAYERS.find((p) => p.id === playerId);
  if (!player) return NextResponse.json({ error: "Unknown player" }, { status: 400 });

  const course = getCourse(roundSlug);
  if (!course) return NextResponse.json({ error: "Unknown course" }, { status: 400 });

  const grossTotal = calcGrossTotal(holes);
  const netTotal = calcNetScore(holes, player.handicap, course.holes);

  await saveIndividualScore(playerId, roundSlug, holes, grossTotal, netTotal);
  return NextResponse.json({ ok: true, grossTotal, netTotal });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || !isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { playerId, roundSlug } = await req.json();
  await deleteIndividualScore(playerId, roundSlug);
  return NextResponse.json({ ok: true });
}
