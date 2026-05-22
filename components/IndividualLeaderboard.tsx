"use client";

import { useState } from "react";
import { PlayerTotals } from "@/lib/scoring";
import { COURSES } from "@/data/courses";
import { TEAM_FLAGS } from "@/data/players";
import Link from "next/link";

interface IndividualLeaderboardProps {
  totals: PlayerTotals[];
  title?: string;
  showRoundColumns?: boolean;
}

type SortKey = "net" | "gross";

function toParColor(score: number, par: number) {
  const d = score - par;
  if (d < 0) return "text-red-700 font-bold";
  if (d > 0) return "text-blue-800";
  return "text-[#1a1a2e]";
}

export default function IndividualLeaderboard({
  totals,
  title = "Individual Standings",
  showRoundColumns = true,
}: IndividualLeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortKey>("net");

  const sorted = [...totals].sort((a, b) => {
    if (a.roundsPlayed === 0 && b.roundsPlayed === 0) return 0;
    if (a.roundsPlayed === 0) return 1;
    if (b.roundsPlayed === 0) return -1;
    return sortBy === "net" ? a.totalNet - b.totalNet : a.totalGross - b.totalGross;
  });

  const withPos = sorted.map((entry, i) => {
    if (entry.roundsPlayed === 0) return { ...entry, posLabel: "" };
    const val = sortBy === "net" ? entry.totalNet : entry.totalGross;
    const prevVal =
      i > 0 && sorted[i - 1].roundsPlayed > 0
        ? sortBy === "net" ? sorted[i - 1].totalNet : sorted[i - 1].totalGross
        : null;
    const isTied = prevVal === val;
    const actualPos =
      sorted.slice(0, i).filter(
        (x) => x.roundsPlayed > 0 && (sortBy === "net" ? x.totalNet : x.totalGross) < val
      ).length + 1;
    return { ...entry, posLabel: isTied ? "" : String(actualPos) };
  });

  const playedCourses = COURSES.filter((c) =>
    totals.some((t) => t.rounds.some((r) => r.slug === c.slug))
  );
  const coursePar = (slug: string) => COURSES.find((c) => c.slug === slug)?.totalPar ?? 72;

  return (
    <div className="rounded-lg shadow-lg overflow-hidden font-sans">
      {/* Dark header */}
      <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between">
        <h2 className="text-white font-bold tracking-wide uppercase text-sm">{title}</h2>
        <div className="flex gap-1">
          {(["net", "gross"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${
                sortBy === key
                  ? "bg-[#F5C842] text-[#1a1a2e]"
                  : "text-white/50 hover:text-white border border-white/20"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Column labels */}
      <div className="bg-[#d4a82a] text-[#1a1a2e] text-[11px] font-bold uppercase tracking-wider">
        <div className="flex items-center px-2 py-1.5">
          <span className="w-7 text-center shrink-0">POS</span>
          <span className="w-7 shrink-0" />
          <span className="flex-1 pl-1">Player</span>
          {/* Round cols — hidden on mobile */}
          {showRoundColumns && playedCourses.map((c, i) => (
            <span key={c.slug} className="hidden md:block w-9 text-center shrink-0">R{i + 1}</span>
          ))}
          <span className="w-12 text-center shrink-0">Total</span>
          <span className="hidden sm:block w-10 text-center shrink-0">Hdcp</span>
        </div>
      </div>

      {/* Rows */}
      <div>
        {withPos.map((entry, i) => {
          const val = sortBy === "net" ? entry.totalNet : entry.totalGross;
          const totalPar = entry.rounds.reduce((s, r) => s + coursePar(r.slug), 0);
          const flagVal = TEAM_FLAGS[entry.player.team];
          const flag = flagVal.startsWith("http")
            ? <img src={flagVal} alt={entry.player.team} className="w-6 h-4 object-cover rounded-sm inline-block" />
            : flagVal;

          return (
            <div
              key={entry.player.id}
              className="flex items-center border-b border-[#d4a82a]/50 last:border-0"
              style={{ background: i % 2 === 0 ? "#F5C842" : "#f0c030" }}
            >
              {/* Position */}
              <span className="w-7 text-center shrink-0 font-black text-[#1a1a2e] text-sm py-3">
                {entry.posLabel}
              </span>

              {/* Flag */}
              <span className="w-7 text-center shrink-0 text-base leading-none py-3">
                {flag}
              </span>

              {/* Name */}
              <span className="flex-1 pl-1 py-3 min-w-0">
                <span className="font-bold text-[#1e3a8a] text-sm leading-tight block truncate">
                  {entry.player.name}
                  {entry.player.captain && (
                    <span className="ml-1 text-[10px] text-[#1e3a8a]/60">(C)</span>
                  )}
                </span>
              </span>

              {/* Round scores — hidden on mobile */}
              {showRoundColumns && playedCourses.map((c) => {
                const round = entry.rounds.find((r) => r.slug === c.slug);
                const score = round ? (sortBy === "net" ? round.net : round.gross) : null;
                const par = coursePar(c.slug);
                return (
                  <Link
                    key={c.slug}
                    href={`/course/${c.slug}`}
                    className="hidden md:block w-9 text-center shrink-0 py-3 hover:bg-[#e8b830] transition-colors"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                  >
                    {score != null
                      ? <span className={`text-sm font-semibold ${toParColor(score, par)}`}>{score}</span>
                      : <span className="text-[#1a1a2e]/25 text-sm">–</span>}
                  </Link>
                );
              })}

              {/* Total */}
              <span
                className="w-12 text-center shrink-0 py-3"
                style={{ background: "rgba(0,0,0,0.10)" }}
              >
                {entry.roundsPlayed > 0
                  ? <span className={`text-sm font-black ${toParColor(val, totalPar)}`}>{val}</span>
                  : <span className="text-[#1a1a2e]/25 text-sm">–</span>}
              </span>

              {/* Handicap — hidden on smallest screens */}
              <span
                className="hidden sm:block w-10 text-center shrink-0 py-3 text-xs text-[#1a1a2e]/60"
                style={{ background: "rgba(0,0,0,0.06)" }}
              >
                +{entry.player.handicap}
              </span>
            </div>
          );
        })}
      </div>

      {withPos.length === 0 && (
        <div className="px-4 py-10 text-center text-[#1a1a2e]/40 text-sm" style={{ background: "#F5C842" }}>
          No scores posted yet.
        </div>
      )}

      {/* Awards */}
      {totals.some((t) => t.roundsPlayed > 0) && (
        <div className="bg-[#1a1a2e] px-4 py-2 text-xs text-white/60 flex flex-wrap gap-x-4 gap-y-1">
          {(() => {
            const played = totals.filter((t) => t.roundsPlayed > 0);
            const lowGross = [...played].sort((a, b) => a.totalGross - b.totalGross)[0];
            const lowNet   = [...played].sort((a, b) => a.totalNet   - b.totalNet  )[0];
            const dfl      = [...played].sort((a, b) => b.totalNet   - a.totalNet  )[0];
            return (
              <>
                <span>🏆 Low Gross: <strong className="text-white">{lowGross?.player.name}</strong> ({lowGross?.totalGross})</span>
                <span>🥇 Low Net: <strong className="text-white">{lowNet?.player.name}</strong> ({lowNet?.totalNet})</span>
                <span>🚽 DFL: <strong className="text-white">{dfl?.player.name}</strong> ({dfl?.totalNet})</span>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
