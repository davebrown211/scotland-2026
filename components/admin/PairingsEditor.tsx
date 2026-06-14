"use client";

import { useState, useEffect, useCallback } from "react";
import { PLAYERS, getPlayer } from "@/data/players";
import { COURSES } from "@/data/courses";
import { GroupResult, GroupFormat, HoleScore } from "@/lib/scoring";
import { SCHEDULE_PRESETS } from "@/data/schedule";

type Scoring = "gross" | "net";

interface EditorMatch {
  groupId: string;
  format: GroupFormat;
  team1PlayerIds: string[]; // Missouri side
  team2PlayerIds: string[]; // Puerto Rico side
  team1Holes: HoleScore;
  team2Holes: HoleScore;
}

const MO_PLAYERS = PLAYERS.filter((p) => p.team === "missouri" || p.team === "rover");
const PR_PLAYERS = PLAYERS.filter((p) => p.team === "puertoRico" || p.team === "rover");

const FORMAT_LABEL: Record<GroupFormat, string> = {
  singles: "Singles",
  bestBall: "Best Ball",
  alternateShot: "Alt Shot",
  scramble: "Scramble",
};

const ALL_FORMATS: GroupFormat[] = ["singles", "bestBall", "scramble", "alternateShot"];

const maxForFormat = (f: GroupFormat) => (f === "singles" ? 1 : 2);

// Derive a side's team from its players (ignoring the rover).
function teamForSide(playerIds: string[], fallback: "missouri" | "puertoRico"): string {
  for (const id of playerIds) {
    const t = getPlayer(id)?.team;
    if (t === "missouri" || t === "puertoRico") return t;
  }
  return fallback;
}

function firstName(id: string): string {
  return getPlayer(id)?.name.split(" ")[0] ?? id;
}

export default function PairingsEditor() {
  const [presetId, setPresetId] = useState(SCHEDULE_PRESETS[0].id);
  const [roundSlug, setRoundSlug] = useState(COURSES[0].slug);
  const [format, setFormat] = useState<GroupFormat>("singles"); // round default
  const [scoring, setScoring] = useState<Scoring>("gross");
  const [matches, setMatches] = useState<EditorMatch[]>([]);
  const [loadedGroupIds, setLoadedGroupIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const course = COURSES.find((c) => c.slug === roundSlug)!;
  const roundIndex = COURSES.findIndex((c) => c.slug === roundSlug);
  const preset = SCHEDULE_PRESETS.find((p) => p.id === presetId);
  const presetRound = preset?.rounds[roundSlug];

  const loadRound = useCallback(async () => {
    setMessage(null);
    const res = await fetch(`/api/groups?round=${roundSlug}`);
    const data: GroupResult[] = await res.json().catch(() => []);
    if (data.length > 0) {
      setFormat(data[0].format);
      setScoring(data[0].scoring === "net" ? "net" : "gross");
      setMatches(
        data.map((g) => ({
          groupId: g.groupId,
          format: g.format,
          team1PlayerIds: g.team1.playerIds,
          team2PlayerIds: g.team2.playerIds,
          team1Holes: g.team1Holes ?? {},
          team2Holes: g.team2Holes ?? {},
        }))
      );
      setLoadedGroupIds(data.map((g) => g.groupId));
    } else {
      // No saved pairings — default to the first preset's format/scoring for
      // this round. (Not keyed to the dropdown, so switching presets never
      // wipes an unsaved preview — use "Load this round" to apply a preset.)
      const r = SCHEDULE_PRESETS[0].rounds[roundSlug];
      setFormat(r?.format ?? "singles");
      setScoring(r?.scoring ?? "gross");
      setMatches([]);
      setLoadedGroupIds([]);
    }
  }, [roundSlug]);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  const loadPreset = () => {
    if (!presetRound) return;
    if (
      matches.length > 0 &&
      !confirm(
        `Replace this round's matchups with "${preset?.name}"? ` +
          "Any unsaved changes — and hole scores on existing matches — will be reset when you save."
      )
    ) {
      return;
    }
    setFormat(presetRound.format);
    setScoring(presetRound.scoring);
    setMatches(
      presetRound.matches.map((mm, i) => ({
        groupId: `${roundSlug}_p${i}`,
        format: mm.format ?? presetRound.format,
        team1PlayerIds: mm.team1PlayerIds,
        team2PlayerIds: mm.team2PlayerIds,
        team1Holes: {},
        team2Holes: {},
      }))
    );
    setMessage(null);
  };

  // Round-level format select — applies to every match (the common, uniform case).
  const applyRoundFormat = (f: GroupFormat) => {
    setFormat(f);
    setMatches((prev) =>
      prev.map((mt) => ({
        ...mt,
        format: f,
        team1PlayerIds: f === "singles" ? mt.team1PlayerIds.slice(0, 1) : mt.team1PlayerIds,
        team2PlayerIds: f === "singles" ? mt.team2PlayerIds.slice(0, 1) : mt.team2PlayerIds,
      }))
    );
  };

  const setMatchFormat = (idx: number, f: GroupFormat) => {
    setMatches((prev) =>
      prev.map((mt, i) =>
        i === idx
          ? {
              ...mt,
              format: f,
              team1PlayerIds: f === "singles" ? mt.team1PlayerIds.slice(0, 1) : mt.team1PlayerIds,
              team2PlayerIds: f === "singles" ? mt.team2PlayerIds.slice(0, 1) : mt.team2PlayerIds,
            }
          : mt
      )
    );
  };

  const addMatch = () => {
    setMatches((prev) => [
      ...prev,
      {
        groupId: `${roundSlug}_${Date.now()}`,
        format,
        team1PlayerIds: [],
        team2PlayerIds: [],
        team1Holes: {},
        team2Holes: {},
      },
    ]);
  };

  const removeMatch = (idx: number) => {
    setMatches((prev) => prev.filter((_, i) => i !== idx));
  };

  const togglePlayer = (idx: number, side: "team1" | "team2", playerId: string) => {
    setMatches((prev) =>
      prev.map((mt, i) => {
        if (i !== idx) return mt;
        const key = side === "team1" ? "team1PlayerIds" : "team2PlayerIds";
        const current = mt[key];
        const max = maxForFormat(mt.format);
        let next: string[];
        if (current.includes(playerId)) {
          next = current.filter((id) => id !== playerId);
        } else if (max === 1) {
          next = [playerId];
        } else if (current.length >= max) {
          next = [...current.slice(1), playerId]; // drop oldest
        } else {
          next = [...current, playerId];
        }
        return { ...mt, [key]: next };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const currentIds = new Set(matches.map((mt) => mt.groupId));

      // Upsert every match in the editor.
      for (const mt of matches) {
        await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: mt.groupId,
            roundSlug,
            format: mt.format,
            scoring,
            team1: { team: teamForSide(mt.team1PlayerIds, "missouri"), playerIds: mt.team1PlayerIds },
            team2: { team: teamForSide(mt.team2PlayerIds, "puertoRico"), playerIds: mt.team2PlayerIds },
            team1Holes: mt.team1Holes,
            team2Holes: mt.team2Holes,
          }),
        });
      }

      // Delete any previously-saved groups that were removed/replaced.
      for (const id of loadedGroupIds) {
        if (!currentIds.has(id)) {
          await fetch("/api/groups", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId: id }),
          });
        }
      }

      setMessage({ type: "success", text: `Saved ${matches.length} matchup${matches.length !== 1 ? "s" : ""}.` });
      await loadRound();
    } catch {
      setMessage({ type: "error", text: "Save failed — check connection and try again." });
    }
    setSaving(false);
  };

  const eligible = (side: "team1" | "team2") => (side === "team1" ? MO_PLAYERS : PR_PLAYERS);

  return (
    <div className="space-y-6">
      {/* Preset picker */}
      <div className="bg-[#1a3c2b]/5 border border-[#1a3c2b]/15 rounded-lg p-4">
        <label className="block text-sm font-semibold text-[#1a3c2b] mb-1">Pairing preset</label>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {SCHEDULE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={loadPreset}
            disabled={!presetRound}
            className="text-sm bg-[#1a3c2b] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2d6147] disabled:opacity-40 whitespace-nowrap"
          >
            ↻ Load this round
          </button>
        </div>
        {preset && <p className="text-xs text-gray-500 mt-2">{preset.description}</p>}
      </div>

      {/* Round + format + scoring controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
          <select
            value={roundSlug}
            onChange={(e) => setRoundSlug(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {COURSES.map((c, i) => (
              <option key={c.slug} value={c.slug}>
                Round {i + 1} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Format (all matches)</label>
          <select
            value={format}
            onChange={(e) => applyRoundFormat(e.target.value as GroupFormat)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {ALL_FORMATS.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABEL[f]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scoring</label>
          <select
            value={scoring}
            onChange={(e) => setScoring(e.target.value as Scoring)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="gross">Gross</option>
            <option value="net">Net</option>
          </select>
        </div>
      </div>

      {/* Visual board */}
      <div className="rounded-xl overflow-hidden border border-[#d4a82a]/40">
        <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-sm tracking-wide">
              Round {roundIndex + 1} · {course.name}
            </h3>
            <p className="text-white/50 text-xs mt-0.5">
              {new Date(course.date + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "short", day: "numeric",
              })}
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wide bg-white/15 text-white px-2 py-0.5 rounded">
            {scoring}
          </span>
        </div>

        <div className="bg-[#F5C842]/15 divide-y divide-[#d4a82a]/30">
          <div className="grid grid-cols-[1fr_auto_1fr] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1a1a2e]/50">
            <span className="text-red-700">Team Missouri</span>
            <span className="text-center">format</span>
            <span className="text-right text-blue-700">Team Puerto Rico</span>
          </div>
          {matches.length === 0 ? (
            <div className="px-4 py-6 text-center text-[#1a1a2e]/40 text-sm">
              No matchups yet — load a preset above or add a match below.
            </div>
          ) : (
            matches.map((mt) => (
              <div key={mt.groupId} className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5 text-sm gap-2">
                <span className="font-semibold text-red-800">
                  {mt.team1PlayerIds.length ? mt.team1PlayerIds.map(firstName).join(" & ") : "—"}
                </span>
                <span className="text-center text-[10px] font-bold uppercase text-[#1a1a2e]/60 bg-[#1a1a2e]/10 rounded px-2 py-0.5 whitespace-nowrap">
                  {FORMAT_LABEL[mt.format]}
                </span>
                <span className="font-semibold text-blue-800 text-right">
                  {mt.team2PlayerIds.length ? mt.team2PlayerIds.map(firstName).join(" & ") : "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Match editors */}
      <div className="space-y-3">
        {matches.map((mt, idx) => (
          <div key={mt.groupId} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Match {idx + 1}</span>
              <div className="flex items-center gap-2">
                <select
                  value={mt.format}
                  onChange={(e) => setMatchFormat(idx, e.target.value as GroupFormat)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                >
                  {ALL_FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {FORMAT_LABEL[f]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeMatch(idx)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(["team1", "team2"] as const).map((side) => (
                <div key={side}>
                  <div className={`text-xs font-semibold mb-1.5 ${side === "team1" ? "text-red-700" : "text-blue-700"}`}>
                    {side === "team1" ? "Team Missouri" : "Team Puerto Rico"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {eligible(side).map((p) => {
                      const selected = mt[side === "team1" ? "team1PlayerIds" : "team2PlayerIds"].includes(p.id);
                      const isRover = p.team === "rover";
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePlayer(idx, side, p.id)}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            selected
                              ? side === "team1"
                                ? "bg-red-700 text-white border-red-700"
                                : "bg-blue-700 text-white border-blue-700"
                              : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                          title={isRover ? "Charlie — rover (rotates teams)" : undefined}
                        >
                          {p.name.split(" ")[0]}
                          {isRover ? " ✦" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={addMatch}
          className="flex-1 border-2 border-dashed border-[#1a3c2b] text-[#1a3c2b] py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a3c2b]/5 transition-colors"
        >
          + Add Match
        </button>
        <button
          onClick={handleSave}
          disabled={saving || matches.length === 0}
          className="bg-[#1a3c2b] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2d6147] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Pairings"}
        </button>
      </div>

      {message && (
        <p className={`text-sm text-center ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
