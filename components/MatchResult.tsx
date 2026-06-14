import { GroupResult } from "@/lib/scoring";
import { calcGroupResult } from "@/lib/scoring";
import { PLAYERS, TEAM_NAMES } from "@/data/players";
import { getCourse } from "@/data/courses";

interface MatchResultProps {
  group: GroupResult;
  expanded?: boolean;
}

const FORMAT_LABEL: Record<GroupResult["format"], string> = {
  singles: "Singles",
  bestBall: "Best Ball",
  scramble: "Scramble",
  alternateShot: "Alternate Shot",
};

export default function MatchResult({ group, expanded = false }: MatchResultProps) {
  const holes = getCourse(group.roundSlug)?.holes ?? [];
  const matchResult = calcGroupResult(group, PLAYERS, holes);
  const t1Names = group.team1.playerIds.map((id) => PLAYERS.find((p) => p.id === id)?.name ?? id);
  const t2Names = group.team2.playerIds.map((id) => PLAYERS.find((p) => p.id === id)?.name ?? id);
  const t1TeamName = TEAM_NAMES[group.team1.team as keyof typeof TEAM_NAMES] ?? group.team1.team;
  const t2TeamName = TEAM_NAMES[group.team2.team as keyof typeof TEAM_NAMES] ?? group.team2.team;

  const formatLabel = FORMAT_LABEL[group.format] ?? group.format;
  const scoringLabel = group.scoring === "net" ? "Net" : "Gross";

  // A pairing with no scores entered yet — show it as an upcoming matchup
  // rather than a finished "all square" result.
  const hasAnyScore =
    Object.values(group.team1Holes ?? {}).some((v) => v != null) ||
    Object.values(group.team2Holes ?? {}).some((v) => v != null);

  if (!hasAnyScore) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-[#1a3c2b] text-white px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-medium text-white/70">
            {formatLabel} · {scoringLabel}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide bg-white/15 px-2 py-0.5 rounded">
            Upcoming
          </span>
        </div>
        <div className="grid grid-cols-3 items-center px-4 py-3 bg-[#F5C842]/10">
          <div>
            <div className="font-semibold text-sm text-blue-800">{t1TeamName}</div>
            <div className="text-xs text-gray-600">{t1Names.join(" / ")}</div>
          </div>
          <div className="text-center text-gray-400 text-sm font-medium">vs</div>
          <div className="text-right">
            <div className="font-semibold text-sm text-red-800">{t2TeamName}</div>
            <div className="text-xs text-gray-600">{t2Names.join(" / ")}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a3c2b] text-white px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-medium text-white/70">{formatLabel} · {scoringLabel}</span>
        <span className={`font-bold text-sm px-3 py-0.5 rounded ${
          matchResult.winner === "halve"
            ? "bg-gray-400"
            : "bg-[#F5C842] text-[#1a3c2b]"
        }`}>
          {matchResult.statusLabel}
        </span>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-3 items-center px-4 py-3 bg-[#F5C842]/10">
        <div>
          <div className="font-semibold text-sm text-blue-800">{t1TeamName}</div>
          <div className="text-xs text-gray-600">{t1Names.join(" / ")}</div>
          <div className="text-lg font-bold text-blue-800">{group.result.team1Points}</div>
        </div>
        <div className="text-center text-gray-400 text-sm font-medium">vs</div>
        <div className="text-right">
          <div className="font-semibold text-sm text-red-800">{t2TeamName}</div>
          <div className="text-xs text-gray-600">{t2Names.join(" / ")}</div>
          <div className="text-lg font-bold text-red-800">{group.result.team2Points}</div>
        </div>
      </div>

      {/* Hole-by-hole tally */}
      {expanded && (
        <div className="px-4 pb-3 overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50">
                <td className="px-1 py-1 text-left font-medium text-gray-500">Hole</td>
                {matchResult.holeResults.map((h) => (
                  <td key={h.hole} className="px-1 py-1 w-7 font-medium">{h.hole}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-1 py-1 text-left text-blue-700 font-medium">
                  {t1Names[0]?.split(" ")[0]}
                </td>
                {matchResult.holeResults.map((h) => (
                  <td key={h.hole} className={`px-1 py-1 ${h.winner === "team1" ? "bg-blue-50 font-bold text-blue-700" : ""}`}>
                    {h.team1Score ?? "–"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-1 py-1 text-left text-red-700 font-medium">
                  {t2Names[0]?.split(" ")[0]}
                </td>
                {matchResult.holeResults.map((h) => (
                  <td key={h.hole} className={`px-1 py-1 ${h.winner === "team2" ? "bg-red-50 font-bold text-red-700" : ""}`}>
                    {h.team2Score ?? "–"}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-1 py-1 text-left font-medium text-gray-500">Status</td>
                {matchResult.holeResults.map((h) => (
                  <td key={h.hole} className="px-1 py-0.5 font-semibold text-[10px]">
                    {h.team1Score != null && h.team2Score != null ? (
                      h.runningStatus === 0 ? (
                        <span className="text-gray-500">AS</span>
                      ) : h.runningStatus > 0 ? (
                        <span className="text-blue-600">{h.runningStatus}↑</span>
                      ) : (
                        <span className="text-red-600">{Math.abs(h.runningStatus)}↑</span>
                      )
                    ) : null}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
