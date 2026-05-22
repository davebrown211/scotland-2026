import { TeamStandings } from "@/lib/scoring";
import { COURSES } from "@/data/courses";
import { TEAM_FLAGS } from "@/data/players";
import Link from "next/link";

function TeamFlag({ team }: { team: "missouri" | "puertoRico" }) {
  const val = TEAM_FLAGS[team];
  if (val.startsWith("http")) {
    return <img src={val} alt={team} className="w-10 h-7 object-cover rounded-sm mx-auto mt-0.5" />;
  }
  return <span className="text-lg mt-0.5 block">{val}</span>;
}

interface TeamLeaderboardProps {
  standings: TeamStandings;
}

export default function TeamLeaderboard({ standings }: TeamLeaderboardProps) {
  const totalPoints = standings.missouri + standings.puertoRico;
  const moWidth  = totalPoints > 0 ? (standings.missouri   / totalPoints) * 100 : 50;
  const prWidth  = totalPoints > 0 ? (standings.puertoRico / totalPoints) * 100 : 50;

  return (
    <div className="rounded-lg shadow-lg overflow-hidden">
      <div className="bg-[#1a1a2e] px-4 py-3">
        <h2 className="font-bold text-white tracking-wide uppercase text-sm">Team Standings</h2>
        <p className="text-white/50 text-xs mt-0.5">Ryder Cup · Points by Match</p>
      </div>

      <div className="bg-[#F5C842] px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Missouri — USA red */}
          <div className="text-center flex-1">
            <div className="text-4xl font-black text-red-700">{standings.missouri}</div>
            <TeamFlag team="missouri" />
          </div>

          <div className="font-serif text-xl font-bold text-[#1a1a2e] shrink-0">vs</div>

          {/* Puerto Rico — blue */}
          <div className="text-center flex-1">
            <div className="text-4xl font-black text-blue-700">{standings.puertoRico}</div>
            <TeamFlag team="puertoRico" />
          </div>
        </div>

        {totalPoints > 0 && (
          <div className="mt-3 flex h-3 rounded-full overflow-hidden">
            <div className="bg-red-600 transition-all duration-500"  style={{ width: `${moWidth}%` }} />
            <div className="bg-blue-600 transition-all duration-500" style={{ width: `${prWidth}%` }} />
          </div>
        )}
      </div>

      {standings.roundResults.length > 0 && (
        <div className="divide-y divide-[#d4a82a]/40" style={{ background: "#F5C842" }}>
          <div className="grid grid-cols-3 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1a1a2e]/60">
            <span>🇺🇸 MO</span>
            <span className="text-center">Round</span>
            <span className="text-right">PR 🇵🇷</span>
          </div>
          {standings.roundResults.map((r) => {
            const course = COURSES.find((c) => c.slug === r.slug);
            const moWon  = r.missouri   > r.puertoRico;
            const prWon  = r.puertoRico > r.missouri;
            return (
              <div key={r.slug} className="grid grid-cols-3 items-center px-4 py-2 text-sm">
                <span className={`font-bold ${moWon ? "text-red-700" : "text-[#1a1a2e]/40"}`}>
                  {r.missouri}
                </span>
                <Link href={`/course/${r.slug}`} className="text-center text-xs text-[#1a1a2e] hover:underline">
                  {course?.name.split(" ").slice(0, 2).join(" ") ?? r.slug}
                </Link>
                <span className={`font-bold text-right ${prWon ? "text-blue-700" : "text-[#1a1a2e]/40"}`}>
                  {r.puertoRico}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {standings.roundResults.length === 0 && (
        <div className="px-4 py-6 text-center text-[#1a1a2e]/40 text-sm" style={{ background: "#F5C842" }}>
          No matches recorded yet.
        </div>
      )}
    </div>
  );
}
