import { HoleInfo } from "@/data/courses";
import { Player } from "@/data/players";

export interface HoleScore {
  [hole: number]: number | null;
}

export interface IndividualRoundScore {
  playerId: string;
  roundSlug: string;
  holes: HoleScore;
  grossTotal: number;
  netTotal: number;
}

export interface PlayerTotals {
  player: Player;
  rounds: { slug: string; gross: number; net: number }[];
  totalGross: number;
  totalNet: number;
  roundsPlayed: number;
  position?: number;
}

export type GroupFormat = "bestBall" | "alternateShot" | "singles" | "scramble";

export interface GroupResult {
  groupId: string;
  roundSlug: string;
  format: GroupFormat;
  scoring?: "gross" | "net";
  team1: { team: string; playerIds: string[] };
  team2: { team: string; playerIds: string[] };
  team1Holes: HoleScore;
  team2Holes: HoleScore;
  result: {
    winner: "team1" | "team2" | "halve";
    team1Points: number;
    team2Points: number;
  };
}

// Distribute handicap strokes across holes using stroke index.
// Returns an array of strokes received per hole (index 0 = hole 1).
export function handicapStrokesPerHole(
  handicap: number,
  holes: HoleInfo[]
): number[] {
  const strokes = new Array(18).fill(0);
  const fullStrokes = Math.min(handicap, 18);
  const extraStrokes = Math.max(0, handicap - 18);

  for (const hole of holes) {
    const idx = hole.hole - 1;
    if (hole.strokeIndex <= fullStrokes) strokes[idx] += 1;
    if (hole.strokeIndex <= extraStrokes) strokes[idx] += 1;
  }
  return strokes;
}

// Calculate net score for a round given gross hole scores and hole info.
export function calcNetScore(
  holeScores: HoleScore,
  handicap: number,
  holes: HoleInfo[]
): number {
  const strokesPerHole = handicapStrokesPerHole(handicap, holes);
  let net = 0;
  for (let i = 0; i < 18; i++) {
    const gross = holeScores[i + 1];
    if (gross != null) {
      net += gross - strokesPerHole[i];
    }
  }
  return net;
}

export function calcGrossTotal(holeScores: HoleScore): number {
  let total = 0;
  for (let i = 1; i <= 18; i++) {
    const s = holeScores[i];
    if (s != null) total += s;
  }
  return total;
}

// Build individual leaderboard from a list of round scores and players.
export function buildIndividualLeaderboard(
  scores: IndividualRoundScore[],
  players: Player[]
): PlayerTotals[] {
  const map = new Map<string, PlayerTotals>();

  for (const player of players) {
    map.set(player.id, {
      player,
      rounds: [],
      totalGross: 0,
      totalNet: 0,
      roundsPlayed: 0,
    });
  }

  for (const score of scores) {
    const entry = map.get(score.playerId);
    if (!entry) continue;
    entry.rounds.push({
      slug: score.roundSlug,
      gross: score.grossTotal,
      net: score.netTotal,
    });
    entry.totalGross += score.grossTotal;
    entry.totalNet += score.netTotal;
    entry.roundsPlayed += 1;
  }

  const results = Array.from(map.values()).sort((a, b) => {
    if (a.roundsPlayed === 0 && b.roundsPlayed === 0) return 0;
    if (a.roundsPlayed === 0) return 1;
    if (b.roundsPlayed === 0) return -1;
    return a.totalNet - b.totalNet;
  });

  // Assign positions
  let pos = 1;
  for (let i = 0; i < results.length; i++) {
    if (results[i].roundsPlayed === 0) {
      results[i].position = undefined;
    } else {
      if (i > 0 && results[i].totalNet === results[i - 1].totalNet) {
        results[i].position = results[i - 1].position;
      } else {
        results[i].position = pos;
      }
      pos++;
    }
  }

  return results;
}

// Match play: given two hole score arrays, compute running match status.
// Returns hole-by-hole status and final result.
export interface HoleMatchResult {
  hole: number;
  team1Score: number | null;
  team2Score: number | null;
  winner: "team1" | "team2" | "halve" | null;
  runningStatus: number; // positive = team1 up, negative = team2 up
}

export interface MatchPlayResult {
  holeResults: HoleMatchResult[];
  finalStatus: number; // positive = team1 up
  winner: "team1" | "team2" | "halve";
  team1Points: number;
  team2Points: number;
  statusLabel: string; // e.g. "2&1", "AS", "3UP"
}

export function calcMatchPlayResult(
  team1Holes: HoleScore,
  team2Holes: HoleScore,
  totalHoles = 18
): MatchPlayResult {
  const holeResults: HoleMatchResult[] = [];
  let status = 0; // positive = team1 up
  let holesRemaining = totalHoles;
  let finished = false;
  let finishedHole = 0;

  for (let h = 1; h <= totalHoles; h++) {
    const t1 = team1Holes[h] ?? null;
    const t2 = team2Holes[h] ?? null;
    holesRemaining = totalHoles - h;

    let winner: "team1" | "team2" | "halve" | null = null;
    if (t1 != null && t2 != null) {
      if (t1 < t2) { winner = "team1"; status++; }
      else if (t2 < t1) { winner = "team2"; status--; }
      else { winner = "halve"; }

      // Check if match is already decided (dormie or won)
      if (!finished && Math.abs(status) > holesRemaining) {
        finished = true;
        finishedHole = h;
      }
    }

    holeResults.push({ hole: h, team1Score: t1, team2Score: t2, winner, runningStatus: status });
  }

  let winner: "team1" | "team2" | "halve";
  let team1Points: number;
  let team2Points: number;
  let statusLabel: string;

  if (status > 0) {
    winner = "team1";
    team1Points = 1;
    team2Points = 0;
    if (finished) {
      const holesLeft = totalHoles - finishedHole;
      statusLabel = `${status}&${holesLeft}`;
    } else {
      statusLabel = `${status} UP`;
    }
  } else if (status < 0) {
    winner = "team2";
    team1Points = 0;
    team2Points = 1;
    if (finished) {
      const holesLeft = totalHoles - finishedHole;
      statusLabel = `${Math.abs(status)}&${holesLeft}`;
    } else {
      statusLabel = `${Math.abs(status)} UP`;
    }
  } else {
    winner = "halve";
    team1Points = 0.5;
    team2Points = 0.5;
    statusLabel = "AS";
  }

  return { holeResults, finalStatus: status, winner, team1Points, team2Points, statusLabel };
}

// Convert a side's gross hole scores to net, subtracting handicap strokes.
// Uses the lowest-handicap player on the side as the stroke recipient
// (for singles this is simply the one player).
export function netHolesForSide(
  holes: HoleScore,
  playerIds: string[],
  players: Player[],
  holeInfos: HoleInfo[]
): HoleScore {
  const sidePlayers = playerIds
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => !!p);
  if (sidePlayers.length === 0) return holes;
  const handicap = Math.min(...sidePlayers.map((p) => p.handicap));
  const strokes = handicapStrokesPerHole(handicap, holeInfos);
  const net: HoleScore = {};
  for (let h = 1; h <= 18; h++) {
    const g = holes[h];
    net[h] = g != null ? g - strokes[h - 1] : (null as unknown as number);
  }
  return net;
}

// Compute a match result for a group, honouring its gross/net scoring basis.
// Net nets each side before comparing; gross compares raw hole scores.
export function calcGroupResult(
  group: Pick<GroupResult, "scoring" | "team1" | "team2" | "team1Holes" | "team2Holes">,
  players: Player[],
  holeInfos: HoleInfo[]
): MatchPlayResult {
  if (group.scoring === "net") {
    const t1 = netHolesForSide(group.team1Holes, group.team1.playerIds, players, holeInfos);
    const t2 = netHolesForSide(group.team2Holes, group.team2.playerIds, players, holeInfos);
    return calcMatchPlayResult(t1, t2);
  }
  return calcMatchPlayResult(group.team1Holes, group.team2Holes);
}

// Best ball: take the lower of the two scores per hole for a side.
export function bestBallHoles(
  player1Holes: HoleScore,
  player2Holes: HoleScore
): HoleScore {
  const result: HoleScore = {};
  for (let h = 1; h <= 18; h++) {
    const s1 = player1Holes[h] ?? null;
    const s2 = player2Holes[h] ?? null;
    if (s1 != null && s2 != null) result[h] = Math.min(s1, s2);
    else if (s1 != null) result[h] = s1;
    else if (s2 != null) result[h] = s2;
    else result[h] = null as unknown as number;
  }
  return result;
}

export interface TeamStandings {
  missouri: number;
  puertoRico: number;
  roundResults: { slug: string; missouri: number; puertoRico: number }[];
}

export function buildTeamStandings(
  groups: GroupResult[]
): TeamStandings {
  const standings: TeamStandings = {
    missouri: 0,
    puertoRico: 0,
    roundResults: [],
  };

  const byRound = new Map<string, { missouri: number; puertoRico: number }>();

  for (const g of groups) {
    // Skip pairings that haven't been played yet — an unscored match would
    // otherwise register as an all-square halve and inflate the standings.
    const played =
      Object.values(g.team1Holes ?? {}).some((v) => v != null) ||
      Object.values(g.team2Holes ?? {}).some((v) => v != null);
    if (!played) continue;

    if (!byRound.has(g.roundSlug)) {
      byRound.set(g.roundSlug, { missouri: 0, puertoRico: 0 });
    }
    const round = byRound.get(g.roundSlug)!;
    const t1Team = g.team1.team as "missouri" | "puertoRico";
    const t2Team = g.team2.team as "missouri" | "puertoRico";
    if (t1Team === "missouri" || t1Team === "puertoRico") {
      round[t1Team] += g.result.team1Points;
      standings[t1Team] += g.result.team1Points;
    }
    if (t2Team === "missouri" || t2Team === "puertoRico") {
      round[t2Team] += g.result.team2Points;
      standings[t2Team] += g.result.team2Points;
    }
  }

  for (const [slug, pts] of byRound.entries()) {
    standings.roundResults.push({ slug, ...pts });
  }

  return standings;
}
