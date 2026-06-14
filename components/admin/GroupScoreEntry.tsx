"use client";

import { useState, useEffect, useCallback } from "react";
import { PLAYERS, TEAM_NAMES } from "@/data/players";
import { COURSES } from "@/data/courses";
import { HoleScore, calcGroupResult, GroupFormat } from "@/lib/scoring";
import { GroupResult } from "@/lib/scoring";

type Scoring = "gross" | "net";

const FORMAT_LABEL: Record<GroupFormat, string> = {
  singles: "Singles",
  bestBall: "Best Ball",
  scramble: "Scramble",
  alternateShot: "Alternate Shot",
};

interface GroupFormState {
  groupId: string;
  roundSlug: string;
  format: GroupFormat;
  scoring: Scoring;
  team1PlayerIds: string[];
  team2PlayerIds: string[];
  team1Team: string;
  team2Team: string;
  team1Holes: HoleScore;
  team2Holes: HoleScore;
}

export default function GroupScoreEntry() {
  const [roundSlug, setRoundSlug] = useState(COURSES[0].slug);
  const [groups, setGroups] = useState<GroupFormState[]>([]);
  const [activeGroupIdx, setActiveGroupIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [charlieTodayTeam, setCharlieTodayTeam] = useState<"missouri" | "puertoRico">("missouri");

  const course = COURSES.find((c) => c.slug === roundSlug)!;

  const loadGroups = useCallback(async () => {
    const res = await fetch(`/api/groups?round=${roundSlug}`);
    const data: GroupResult[] = await res.json().catch(() => []);
    setGroups(
      data.map((g) => ({
        groupId: g.groupId,
        roundSlug: g.roundSlug,
        format: g.format,
        scoring: g.scoring === "net" ? "net" : "gross",
        team1PlayerIds: g.team1.playerIds,
        team2PlayerIds: g.team2.playerIds,
        team1Team: g.team1.team,
        team2Team: g.team2.team,
        team1Holes: g.team1Holes,
        team2Holes: g.team2Holes,
      }))
    );
  }, [roundSlug]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const addGroup = () => {
    const newGroup: GroupFormState = {
      groupId: `${roundSlug}_${Date.now()}`,
      roundSlug,
      format: "bestBall",
      scoring: "gross",
      team1PlayerIds: [],
      team2PlayerIds: [],
      team1Team: "missouri",
      team2Team: "puertoRico",
      team1Holes: {},
      team2Holes: {},
    };
    setGroups((prev) => [...prev, newGroup]);
    setActiveGroupIdx(groups.length);
  };

  const updateGroup = (idx: number, patch: Partial<GroupFormState>) => {
    setGroups((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, ...patch } : g))
    );
  };

  const setGroupHole = (
    idx: number,
    side: "team1" | "team2",
    hole: number,
    val: string
  ) => {
    const n = parseInt(val);
    updateGroup(idx, {
      [`${side}Holes`]: {
        ...groups[idx][`${side}Holes`],
        [hole]: isNaN(n) || n <= 0 ? null as unknown as number : n,
      },
    });
  };

  const togglePlayer = (idx: number, side: "team1" | "team2", playerId: string) => {
    const g = groups[idx];
    const key = side === "team1" ? "team1PlayerIds" : "team2PlayerIds";
    const current = g[key];
    const max = g.format === "singles" ? 1 : 2;
    let next: string[];
    if (current.includes(playerId)) {
      next = current.filter((id) => id !== playerId);
    } else if (max === 1) {
      next = [playerId];
    } else {
      next = [...current, playerId];
    }
    updateGroup(idx, { [key]: next });
  };

  const handleSave = async (idx: number) => {
    setSaving(true);
    setMessage(null);
    const g = groups[idx];
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: g.groupId,
          roundSlug: g.roundSlug,
          format: g.format,
          scoring: g.scoring,
          team1: { team: g.team1Team, playerIds: g.team1PlayerIds },
          team2: { team: g.team2Team, playerIds: g.team2PlayerIds },
          team1Holes: g.team1Holes,
          team2Holes: g.team2Holes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Match saved! Result: ${data.result.statusLabel}`,
        });
        loadGroups();
      } else {
        setMessage({ type: "error", text: data.error ?? "Save failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setSaving(false);
  };

  const handleDelete = async (groupId: string) => {
    await fetch("/api/groups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });
    loadGroups();
  };

  // Get available players factoring in Charlie's team assignment
  const getPlayersForTeam = (team: "missouri" | "puertoRico") => {
    return PLAYERS.filter((p) => {
      if (p.id === "charlie-ruger") return team === charlieTodayTeam;
      return p.team === team;
    });
  };

  return (
    <div className="space-y-6">
      {/* Round selector + Charlie assignment */}
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
                Round {i + 1} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Charlie Ruger plays for (today)
          </label>
          <select
            value={charlieTodayTeam}
            onChange={(e) => setCharlieTodayTeam(e.target.value as "missouri" | "puertoRico")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="missouri">Team Missouri</option>
            <option value="puertoRico">Team Puerto Rico</option>
          </select>
        </div>
      </div>

      {/* Existing groups */}
      {groups.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Groups for {course.name} ({groups.length} match{groups.length !== 1 ? "es" : ""})
          </h3>
          {groups.map((g, idx) => {
            const isActive = activeGroupIdx === idx;
            const matchResult = calcGroupResult(
              {
                scoring: g.scoring,
                team1: { team: g.team1Team, playerIds: g.team1PlayerIds },
                team2: { team: g.team2Team, playerIds: g.team2PlayerIds },
                team1Holes: g.team1Holes,
                team2Holes: g.team2Holes,
              },
              PLAYERS,
              course.holes
            );
            const t1 = getPlayersForTeam(g.team1Team as "missouri" | "puertoRico");
            const t2 = getPlayersForTeam(g.team2Team as "missouri" | "puertoRico");

            return (
              <div key={g.groupId} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Group header */}
                <div
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => setActiveGroupIdx(isActive ? null : idx)}
                >
                  <div>
                    <span className="font-medium text-sm">
                      {TEAM_NAMES[g.team1Team as keyof typeof TEAM_NAMES] ?? g.team1Team}
                      {" vs "}
                      {TEAM_NAMES[g.team2Team as keyof typeof TEAM_NAMES] ?? g.team2Team}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({FORMAT_LABEL[g.format]}
                      {" · "}{g.scoring === "net" ? "Net" : "Gross"})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                      matchResult.winner === "team1" ? "bg-blue-100 text-blue-700" :
                      matchResult.winner === "team2" ? "bg-red-100 text-red-700" :
                      "bg-gray-200 text-gray-600"
                    }`}>
                      {matchResult.statusLabel}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(g.groupId); }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                    <span className="text-gray-400">{isActive ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expanded editor */}
                {isActive && (
                  <div className="px-4 pb-4 pt-3 space-y-4">
                    {/* Format + scoring */}
                    <div className="flex flex-wrap gap-3">
                      {(["singles", "bestBall", "scramble", "alternateShot"] as GroupFormat[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            // Singles allows only one player per side — trim extras.
                            if (f === "singles") {
                              updateGroup(idx, {
                                format: f,
                                team1PlayerIds: g.team1PlayerIds.slice(0, 1),
                                team2PlayerIds: g.team2PlayerIds.slice(0, 1),
                              });
                            } else {
                              updateGroup(idx, { format: f });
                            }
                          }}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            g.format === f
                              ? "bg-[#1a3c2b] text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {FORMAT_LABEL[f]}
                        </button>
                      ))}
                      <div className="flex gap-1 ml-auto">
                        {(["gross", "net"] as Scoring[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateGroup(idx, { scoring: s })}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                              g.scoring === s
                                ? "bg-[#F5C842] text-[#1a3c2b]"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {s === "gross" ? "Gross" : "Net"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Player selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-blue-700 mb-1">
                          Team Missouri Players
                        </div>
                        {t1.map((p) => (
                          <label key={p.id} className="flex items-center gap-2 text-sm mb-1">
                            <input
                              type={g.format === "singles" ? "radio" : "checkbox"}
                              checked={g.team1PlayerIds.includes(p.id)}
                              onChange={() => togglePlayer(idx, "team1", p.id)}
                            />
                            {p.name} (+{p.handicap})
                          </label>
                        ))}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-red-700 mb-1">
                          Team Puerto Rico Players
                        </div>
                        {t2.map((p) => (
                          <label key={p.id} className="flex items-center gap-2 text-sm mb-1">
                            <input
                              type={g.format === "singles" ? "radio" : "checkbox"}
                              checked={g.team2PlayerIds.includes(p.id)}
                              onChange={() => togglePlayer(idx, "team2", p.id)}
                            />
                            {p.name} (+{p.handicap})
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Hole scores */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-center border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-[#F5C842] text-[#1a3c2b] font-semibold">
                            <td className="px-2 py-1 text-left">Side</td>
                            {course.holes.map((h) => (
                              <td key={h.hole} className="px-1 py-1 w-8">{h.hole}</td>
                            ))}
                          </tr>
                          <tr className="bg-gray-50 text-gray-500">
                            <td className="px-2 py-1 text-left">Par</td>
                            {course.holes.map((h) => (
                              <td key={h.hole} className="px-1 py-1">{h.par}</td>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(["team1", "team2"] as const).map((side) => {
                            const teamLabel = side === "team1" ? "MO" : "PR";
                            const holeObj = side === "team1" ? g.team1Holes : g.team2Holes;
                            return (
                              <tr key={side} className={side === "team1" ? "bg-blue-50" : "bg-red-50"}>
                                <td className={`px-2 py-1 text-left font-semibold ${side === "team1" ? "text-blue-700" : "text-red-700"}`}>
                                  {teamLabel}
                                </td>
                                {course.holes.map((h) => {
                                  const matchHole = matchResult.holeResults[h.hole - 1];
                                  const won = matchHole?.winner === side && matchHole.team1Score != null && matchHole.team2Score != null;
                                  return (
                                    <td key={h.hole} className={`px-0.5 py-1 ${won ? "bg-green-100" : ""}`}>
                                      <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={holeObj[h.hole] ?? ""}
                                        onChange={(e) => setGroupHole(idx, side, h.hole, e.target.value)}
                                        className="w-7 border border-gray-300 rounded text-center text-xs py-1 focus:outline-none focus:ring-1 focus:ring-[#1a3c2b]"
                                        placeholder="–"
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                          {/* Running status row */}
                          <tr className="border-t border-gray-200">
                            <td className="px-2 py-1 text-left text-gray-500 font-medium text-[10px]">STATUS</td>
                            {matchResult.holeResults.map((h) => (
                              <td key={h.hole} className="py-1 text-[10px] font-semibold">
                                {h.team1Score != null && h.team2Score != null ? (
                                  h.runningStatus === 0 ? (
                                    <span className="text-gray-400">AS</span>
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

                    {/* Live result */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        Live result:{" "}
                        <strong className={matchResult.winner === "halve" ? "text-gray-600" : matchResult.winner === "team1" ? "text-blue-700" : "text-red-700"}>
                          {matchResult.statusLabel}
                        </strong>
                        {" · "}Missouri {matchResult.winner === "team1" ? "1" : matchResult.winner === "halve" ? "½" : "0"} pt
                        {" · "}Puerto Rico {matchResult.winner === "team2" ? "1" : matchResult.winner === "halve" ? "½" : "0"} pt
                      </div>
                      <button
                        onClick={() => handleSave(idx)}
                        disabled={saving}
                        className="bg-[#1a3c2b] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2d6147] disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save Match"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={addGroup}
        className="w-full border-2 border-dashed border-[#1a3c2b] text-[#1a3c2b] py-3 rounded-lg text-sm font-medium hover:bg-[#1a3c2b]/5 transition-colors"
      >
        + Add Match Group
      </button>

      {message && (
        <p className={`text-sm text-center ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
