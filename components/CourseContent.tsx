"use client";

import { useState } from "react";
import { PlayerTotals, TeamStandings, IndividualRoundScore, GroupResult } from "@/lib/scoring";
import { HoleInfo } from "@/data/courses";
import { Player } from "@/data/players";
import IndividualLeaderboard from "@/components/IndividualLeaderboard";
import TeamLeaderboard from "@/components/TeamLeaderboard";
import ScoreCard from "@/components/ScoreCard";
import MatchResult from "@/components/MatchResult";
import CourseScorecard from "@/components/CourseScorecard";

type Tab = "scores" | "scorecards" | "matches";

interface CourseContentProps {
  courseName: string;
  totals: PlayerTotals[];
  standings: TeamStandings;
  allScores: IndividualRoundScore[];
  groups: GroupResult[];
  players: Player[];
  holes: HoleInfo[];
}

export default function CourseContent({
  courseName,
  totals,
  standings,
  allScores,
  groups,
  players,
  holes,
}: CourseContentProps) {
  const hasScores = allScores.length > 0;
  const hasMatches = groups.length > 0;

  const defaultTab: Tab = hasScores ? "scorecards" : "scores";
  const [tab, setTab] = useState<Tab>(defaultTab);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "scores", label: "Leaderboard" },
    { key: "scorecards", label: "Scorecards", count: allScores.length },
    { key: "matches", label: "Matches", count: groups.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Tab bar */}
      <div className="flex rounded-lg overflow-hidden border border-[#d4a82a] bg-[#F5C842]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors relative ${
              tab === t.key
                ? "bg-[#1a1a2e] text-[#F5C842]"
                : "text-[#1a1a2e]/60 hover:text-[#1a1a2e]"
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span
                className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? "bg-[#F5C842] text-[#1a1a2e]" : "bg-[#1a1a2e]/15 text-[#1a1a2e]"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Scores tab */}
      {tab === "scores" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IndividualLeaderboard
              totals={totals}
              title={`${courseName} — Scores`}
              showRoundColumns={false}
            />
          </div>
          <div>
            <TeamLeaderboard standings={standings} />
          </div>
        </div>
      )}

      {/* Scorecards tab */}
      {tab === "scorecards" && (
        <div className="space-y-4">
          <CourseScorecard holes={holes} courseName={courseName} />
          {hasScores ? (
            allScores.map((score) => {
              const player = players.find((p) => p.id === score.playerId);
              if (!player) return null;
              return (
                <ScoreCard
                  key={score.playerId}
                  player={player}
                  score={score}
                  holes={holes}
                />
              );
            })
          ) : (
            <div className="bg-white/60 rounded-lg border border-dashed border-[#d4a82a] p-6 text-center text-[#1a1a2e]/40 text-sm">
              No player scores posted yet — check back after tee time.
            </div>
          )}
        </div>
      )}

      {/* Matches tab */}
      {tab === "matches" && (
        <div className="space-y-4">
          {/* Team points summary at top */}
          {hasMatches && (
            <TeamLeaderboard standings={standings} />
          )}
          {hasMatches ? (
            groups.map((group) => (
              <MatchResult key={group.groupId} group={group} expanded />
            ))
          ) : (
            <EmptyState icon="⚔️" message="No match results yet." sub="Check back after tee time." />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, message, sub }: { icon: string; message: string; sub: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-10 text-center text-gray-400">
      <p className="text-4xl mb-3">{icon}</p>
      <p className="font-serif text-xl text-gray-500">{message}</p>
      <p className="text-sm mt-1">{sub}</p>
    </div>
  );
}
