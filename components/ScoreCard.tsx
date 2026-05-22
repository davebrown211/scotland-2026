"use client";

import { useState } from "react";
import { HoleInfo } from "@/data/courses";
import { IndividualRoundScore, handicapStrokesPerHole } from "@/lib/scoring";

interface ScoreCardProps {
  player: { name: string; handicap: number };
  score: IndividualRoundScore;
  holes: HoleInfo[];
}

function scoreBadge(gross: number | null, par: number, strokeReceived: boolean) {
  if (gross == null) return <span className="text-gray-300 text-xs">–</span>;
  const net = gross - (strokeReceived ? 1 : 0);
  const diff = net - par;

  let cls = "badge-par";
  if (diff <= -2) cls = "badge-eagle";
  else if (diff === -1) cls = "badge-birdie";
  else if (diff === 1) cls = "badge-bogey";
  else if (diff === 2) cls = "badge-double";
  else if (diff >= 3) cls = "badge-worse";

  return <span className={`${cls} text-xs`}>{gross}</span>;
}

// Mobile: one nine at a time
function MobileNine({
  holes,
  label,
  strokesPerHole,
  scores,
}: {
  holes: HoleInfo[];
  label: string;
  strokesPerHole: number[];
  scores: IndividualRoundScore["holes"];
}) {
  const totalPar   = holes.reduce((s, h) => s + h.par, 0);
  const totalGross = holes.reduce((s, h) => s + (scores[h.hole] ?? 0), 0);

  return (
    <table className="w-full text-center border-collapse text-[11px]">
      <thead>
        <tr className="bg-[#F5C842] text-[#1a3c2b] font-semibold">
          <td className="px-2 py-1.5 text-left w-12">{label}</td>
          {holes.map((h) => <td key={h.hole} className="py-1.5 w-8">{h.hole}</td>)}
          <td className="px-2 py-1.5 font-bold">{label === "OUT" ? "OUT" : "IN"}</td>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-gray-50 text-gray-500">
          <td className="px-2 py-1 text-left font-medium">Par</td>
          {holes.map((h) => <td key={h.hole} className="py-1">{h.par}</td>)}
          <td className="px-2 py-1 font-bold">{totalPar}</td>
        </tr>
        <tr className="bg-white text-gray-400">
          <td className="px-2 py-1 text-left">SI</td>
          {holes.map((h) => (
            <td key={h.hole} className={`py-1 ${strokesPerHole[h.hole - 1] > 0 ? "text-[#1a3c2b] font-semibold" : ""}`}>
              {h.strokeIndex}
            </td>
          ))}
          <td className="px-2 py-1" />
        </tr>
        <tr className="bg-white text-[12px]">
          <td className="px-2 py-1.5 text-left font-medium text-[#1a3c2b]">Score</td>
          {holes.map((h) => (
            <td key={h.hole} className="py-1.5">
              {scoreBadge(scores[h.hole] ?? null, h.par, strokesPerHole[h.hole - 1] > 0)}
            </td>
          ))}
          <td className="px-2 py-1.5 font-bold text-[#1a3c2b]">{totalGross || "–"}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default function ScoreCard({ player, score, holes }: ScoreCardProps) {
  const [expanded, setExpanded] = useState(true);
  const strokesPerHole = handicapStrokesPerHole(player.handicap, holes);
  const front = holes.slice(0, 9);
  const back  = holes.slice(9, 18);

  const totalPar   = holes.reduce((s, h) => s + h.par, 0);
  const frontPar   = front.reduce((s, h) => s + h.par, 0);
  const backPar    = back.reduce((s, h) => s + h.par, 0);
  const frontGross = front.reduce((s, h) => s + (score.holes[h.hole] ?? 0), 0);
  const backGross  = back.reduce((s, h) => s + (score.holes[h.hole] ?? 0), 0);

  const toPar = (score.grossTotal || 0) - totalPar;
  const toParLabel = toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : `${toPar}`;
  const toParColor = toPar < 0 ? "text-red-500" : toPar > 0 ? "text-blue-400" : "text-gray-100";

  const netToPar = (score.netTotal || 0) - totalPar;
  const netToParLabel = netToPar === 0 ? "E" : netToPar > 0 ? `+${netToPar}` : `${netToPar}`;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header — tap to expand/collapse */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full bg-[#1a3c2b] text-white px-4 py-3 flex items-center justify-between text-left"
      >
        <div>
          <span className="font-semibold text-sm">{player.name}</span>
          <span className="ml-2 text-white/50 text-xs">+{player.handicap} hdcp</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-white/60">Gross / Net</div>
            <div className="text-sm font-bold">
              <span className={toParColor}>{score.grossTotal}</span>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-[#F5C842]">{score.netTotal}</span>
            </div>
          </div>
          <div className={`text-lg font-black ${toParColor === "text-gray-100" ? "text-white" : toParColor}`}>
            {toParLabel}
          </div>
          <span className="text-white/40 text-lg">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Summary strip */}
      <div className="bg-[#1a3c2b]/10 px-4 py-1.5 flex gap-4 text-xs text-gray-500">
        <span>Net: <strong className="text-gray-700">{score.netTotal} ({netToParLabel})</strong></span>
        <span>Gross: <strong className="text-gray-700">{score.grossTotal} ({toParLabel})</strong></span>
      </div>

      {expanded && (
        <div className="divide-y divide-gray-100">
          {/* Mobile: stacked front/back */}
          <div className="md:hidden">
            <div className="overflow-x-auto">
              <MobileNine label="OUT" holes={front} strokesPerHole={strokesPerHole} scores={score.holes} />
            </div>
            <div className="overflow-x-auto border-t border-gray-100">
              <MobileNine label="IN"  holes={back}  strokesPerHole={strokesPerHole} scores={score.holes} />
            </div>
          </div>

          {/* Desktop: single full-width table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-center border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#F5C842] text-[#1a3c2b] font-semibold">
                  <td className="px-3 py-2 text-left w-14">Hole</td>
                  {front.map((h) => <td key={h.hole} className="py-2 w-9">{h.hole}</td>)}
                  <td className="px-2 py-2 font-bold bg-[#e8b830]">OUT</td>
                  {back.map((h) => <td key={h.hole} className="py-2 w-9">{h.hole}</td>)}
                  <td className="px-2 py-2 font-bold bg-[#e8b830]">IN</td>
                  <td className="px-2 py-2 font-bold bg-[#daa820]">TOT</td>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50 text-gray-500">
                  <td className="px-3 py-1.5 text-left font-medium">Par</td>
                  {front.map((h) => <td key={h.hole} className="py-1.5">{h.par}</td>)}
                  <td className="px-2 py-1.5 font-bold bg-gray-100">{frontPar}</td>
                  {back.map((h) => <td key={h.hole} className="py-1.5">{h.par}</td>)}
                  <td className="px-2 py-1.5 font-bold bg-gray-100">{backPar}</td>
                  <td className="px-2 py-1.5 font-bold bg-gray-200">{frontPar + backPar}</td>
                </tr>
                <tr className="bg-white text-gray-400">
                  <td className="px-3 py-1.5 text-left">SI</td>
                  {front.map((h) => (
                    <td key={h.hole} className={`py-1.5 ${strokesPerHole[h.hole - 1] > 0 ? "text-[#1a3c2b] font-semibold" : ""}`}>
                      {h.strokeIndex}
                    </td>
                  ))}
                  <td className="px-2 py-1.5 bg-gray-50" />
                  {back.map((h) => (
                    <td key={h.hole} className={`py-1.5 ${strokesPerHole[h.hole - 1] > 0 ? "text-[#1a3c2b] font-semibold" : ""}`}>
                      {h.strokeIndex}
                    </td>
                  ))}
                  <td className="px-2 py-1.5 bg-gray-50" />
                  <td className="px-2 py-1.5 bg-gray-100" />
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-1.5 text-left font-medium text-[#1a3c2b] text-xs">Score</td>
                  {front.map((h) => (
                    <td key={h.hole} className="py-1.5">
                      {scoreBadge(score.holes[h.hole] ?? null, h.par, strokesPerHole[h.hole - 1] > 0)}
                    </td>
                  ))}
                  <td className="px-2 py-1.5 font-bold text-[#1a3c2b] bg-gray-50">{frontGross || "–"}</td>
                  {back.map((h) => (
                    <td key={h.hole} className="py-1.5">
                      {scoreBadge(score.holes[h.hole] ?? null, h.par, strokesPerHole[h.hole - 1] > 0)}
                    </td>
                  ))}
                  <td className="px-2 py-1.5 font-bold text-[#1a3c2b] bg-gray-50">{backGross || "–"}</td>
                  <td className="px-2 py-1.5 font-bold text-[#1a3c2b] bg-gray-100">{score.grossTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals footer */}
          <div className="flex justify-end gap-6 px-4 py-2 bg-[#1a3c2b]/5 text-sm font-bold text-[#1a3c2b]">
            <span>Total: {score.grossTotal}</span>
            <span className="text-[#1a3c2b]/60">Net: {score.netTotal}</span>
          </div>
        </div>
      )}
    </div>
  );
}
