export type Team = "missouri" | "puertoRico" | "rover";

export interface Player {
  id: string;
  name: string;
  handicap: number;
  team: Team;
  captain?: boolean;
}

export const PLAYERS: Player[] = [
  // Team Missouri
  { id: "don-steele", name: "Don Steele", handicap: 8, team: "missouri", captain: true },
  { id: "aaron-love", name: "Aaron Love", handicap: 8, team: "missouri" },
  { id: "craig-brown", name: "Craig Brown", handicap: 12, team: "missouri" },
  { id: "bobby-schembre", name: "Bobby Schembre", handicap: 12, team: "missouri" },
  { id: "mike-love", name: "Mike Love", handicap: 16, team: "missouri" },
  // Team Puerto Rico
  { id: "david-brown", name: "David Brown", handicap: 8, team: "puertoRico", captain: true },
  { id: "angel-perez", name: "Angel Perez", handicap: 8, team: "puertoRico" },
  { id: "angel-perez-jr", name: "Angel Jr. Perez", handicap: 12, team: "puertoRico" },
  { id: "egidio-montanile", name: "Egidio Montanile", handicap: 12, team: "puertoRico" },
  { id: "rick-brown", name: "Rick Brown", handicap: 16, team: "puertoRico" },
  // Rover
  { id: "charlie-ruger", name: "Charlie Ruger", handicap: 12, team: "rover" },
];

export const TEAM_NAMES: Record<Team, string> = {
  missouri: "Team Missouri",
  puertoRico: "Team Puerto Rico",
  rover: "Rover",
};

// Missouri = USA red, Puerto Rico = blue
export const TEAM_COLORS: Record<Team, { bg: string; text: string; border: string }> = {
  missouri:  { bg: "bg-red-700",  text: "text-white", border: "border-red-700"  },
  puertoRico:{ bg: "bg-blue-700", text: "text-white", border: "border-blue-700" },
  rover:     { bg: "bg-gray-500", text: "text-white", border: "border-gray-500" },
};

export const TEAM_FLAGS: Record<Team, string> = {
  missouri:   "https://upload.wikimedia.org/wikipedia/commons/5/5a/Flag_of_Missouri.svg",
  puertoRico: "https://upload.wikimedia.org/wikipedia/commons/2/28/Flag_of_Puerto_Rico.svg",
  rover:      "🏌️",
};

export function getPlayer(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

// Given (first) name = everything except the final surname token, so
// "Angel Jr. Perez" → "Angel Jr." and "Don Steele" → "Don".
export function givenName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length <= 1 ? name : parts.slice(0, -1).join(" ");
}
