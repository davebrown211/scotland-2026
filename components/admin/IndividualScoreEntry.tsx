"use client";

import { useState, useEffect } from "react";
import { PLAYERS } from "@/data/players";
import { COURSES } from "@/data/courses";
import { HoleScore } from "@/lib/scoring";

export default function IndividualScoreEntry() {
  const [roundSlug, setRoundSlug] = useState(COURSES[0].slug);
  const [playerId, setPlayerId] = useState(PLAYERS[0].id);
  const [holes, setHoles] = useState<HoleScore>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const course = COURSES.find((c) => c.slug === roundSlug)!;

  // Load existing score when player/round changes
  useEffect(() => {
    fetch(`/api/scores?round=${roundSlug}`)
      .then((r) => r.json())
      .then((scores) => {
        const existing = scores.find(
          (s: { playerId: string; holes: HoleScore }) => s.playerId === playerId
        );
        setHoles(existing?.holes ?? {});
        setHasExisting(!!existing);
      })
      .catch(() => {});
  }, [roundSlug, playerId]);

  const setHole = (hole: number, val: string) => {
    const n = parseInt(val);
    setHoles((prev) => ({
      ...prev,
      [hole]: isNaN(n) || n <= 0 ? null as unknown as number : n,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, roundSlug, holes }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Saved! Gross: ${data.grossTotal}, Net: ${data.netTotal}`,
        });
      } else {
        setMessage({ type: "error", text: data.error ?? "Save failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${player.name}'s score for ${course.name}?`)) return;
    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/scores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, roundSlug }),
      });
      if (res.ok) {
        setHoles({});
        setHasExisting(false);
        setMessage({ type: "success", text: "Score deleted." });
      } else {
        setMessage({ type: "error", text: "Delete failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    }
    setDeleting(false);
  };

  const completedHoles = Object.values(holes).filter((v) => v != null && v > 0).length;
  const player = PLAYERS.find((p) => p.id === playerId)!;

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
          <select
            value={roundSlug}
            onChange={(e) => setRoundSlug(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {COURSES.map((c, i) => (
              <option key={c.slug} value={c.slug}>
                Round {i + 1} — {c.name} ({new Date(c.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
          <select
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {PLAYERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (+{p.handicap})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress */}
      <div className="text-sm text-gray-500">
        {completedHoles}/18 holes entered · {course.name} · Par {course.totalPar}
      </div>

      {/* Hole grid */}
      <div className="space-y-4">
        {/* Front 9 */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Front Nine</div>
          <div className="grid grid-cols-9 gap-2">
            {course.holes.slice(0, 9).map((h) => (
              <div key={h.hole} className="text-center">
                <div className="text-xs font-bold text-[#1a3c2b] mb-0.5">{h.hole}</div>
                <div className="text-[10px] text-gray-400 mb-1">P{h.par}</div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={holes[h.hole] ?? ""}
                  onChange={(e) => setHole(h.hole, e.target.value)}
                  className="w-full border border-gray-300 rounded text-center text-sm py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a3c2b]"
                  placeholder="–"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Back 9 */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Back Nine</div>
          <div className="grid grid-cols-9 gap-2">
            {course.holes.slice(9, 18).map((h) => (
              <div key={h.hole} className="text-center">
                <div className="text-xs font-bold text-[#1a3c2b] mb-0.5">{h.hole}</div>
                <div className="text-[10px] text-gray-400 mb-1">P{h.par}</div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={holes[h.hole] ?? ""}
                  onChange={(e) => setHole(h.hole, e.target.value)}
                  className="w-full border border-gray-300 rounded text-center text-sm py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a3c2b]"
                  placeholder="–"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Running totals */}
      {completedHoles > 0 && (
        <div className="bg-[#F5C842]/20 rounded-lg px-4 py-3 text-sm flex flex-wrap gap-4">
          {(() => {
            const gross = Object.values(holes).reduce((s, v) => s + (v ?? 0), 0);
            const holesEntered = Object.values(holes).filter((v) => v != null && v > 0);
            const parSoFar = course.holes
              .filter((h) => holes[h.hole] != null && holes[h.hole]! > 0)
              .reduce((s, h) => s + h.par, 0);
            const toPar = gross - parSoFar;
            return (
              <>
                <span>
                  Gross: <strong>{gross}</strong>
                </span>
                <span>
                  To par:{" "}
                  <strong className={toPar < 0 ? "text-red-600" : toPar > 0 ? "text-blue-600" : ""}>
                    {toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : toPar}
                  </strong>
                </span>
                <span>Handicap: <strong>+{player.handicap}</strong></span>
                <span className="text-gray-500">{holesEntered.length} holes</span>
              </>
            );
          })()}
        </div>
      )}

      {/* Save / Delete */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving || completedHoles === 0}
          className="bg-[#1a3c2b] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#2d6147] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : hasExisting ? "Update Scores" : "Save Scores"}
        </button>
        {hasExisting && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="border border-red-300 text-red-600 px-4 py-2.5 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
          >
            {deleting ? "Deleting…" : "Delete Score"}
          </button>
        )}
        {message && (
          <span className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
