import { GroupFormat } from "@/lib/scoring";

// Pairing rotation presets for the 5-round trip.
//
// Name → player id mapping:
//   DON=don-steele, AARON=aaron-love, CRAIG=craig-brown, BOBBY=bobby-schembre,
//   MIKE=mike-love (Team Missouri)
//   DAVID=david-brown, ANGEL=angel-perez, MANOLO=angel-perez-jr,
//   EGIDIO=egidio-montanile, RICK=rick-brown (Team Puerto Rico)
//   CHARLIE=charlie-ruger (rover — rotates teams day to day as a real teammate)
//
// 11 players means the odd man is absorbed each day:
//   • Team days (best ball / scramble): two 2v2 matches + one 2v1.
//   • Singles days: five 1v1 matches, or four 1v1 + one alternate-shot 2v1.
// A match's `format` overrides the round's `format` (used for mixed days).

const DON = "don-steele";
const AARON = "aaron-love";
const CRAIG = "craig-brown";
const BOBBY = "bobby-schembre";
const MIKE = "mike-love";
const DAVID = "david-brown";
const ANGEL = "angel-perez";
const MANOLO = "angel-perez-jr";
const EGIDIO = "egidio-montanile";
const RICK = "rick-brown";
const CHARLIE = "charlie-ruger";

export interface ScheduledMatch {
  team1PlayerIds: string[];
  team2PlayerIds: string[];
  format?: GroupFormat; // overrides the round format when set
}

export interface ScheduledRound {
  format: GroupFormat;
  scoring: "gross" | "net";
  matches: ScheduledMatch[];
}

export interface SchedulePreset {
  id: string;
  name: string;
  description: string;
  rounds: Record<string, ScheduledRound>;
}

const m = (a: string[], b: string[], format?: GroupFormat): ScheduledMatch => ({
  team1PlayerIds: a,
  team2PlayerIds: b,
  ...(format ? { format } : {}),
});

export const SCHEDULE_PRESETS: SchedulePreset[] = [
  {
    id: "classic-scramble",
    name: "A · Classic + Scramble",
    description:
      "2 singles, 2 best ball, 1 scramble. Charlie plays the three team days; singles days are clean 1v1.",
    rounds: {
      // D1 — Singles, Gross
      lundin: {
        format: "singles",
        scoring: "gross",
        matches: [
          m([DON], [EGIDIO]),
          m([AARON], [RICK]),
          m([CRAIG], [DAVID]),
          m([BOBBY], [ANGEL]),
          m([MIKE], [MANOLO]),
        ],
      },
      // D2 — Best Ball (Charlie → Missouri)
      kingsbarns: {
        format: "bestBall",
        scoring: "gross",
        matches: [
          m([DON, AARON], [ANGEL, MANOLO]),
          m([CRAIG, BOBBY], [EGIDIO, RICK]),
          m([MIKE, CHARLIE], [DAVID]),
        ],
      },
      // D3 — Scramble (Charlie → Puerto Rico)
      leven: {
        format: "scramble",
        scoring: "gross",
        matches: [
          m([AARON, CRAIG], [RICK, DAVID]),
          m([BOBBY, MIKE], [ANGEL, MANOLO]),
          m([DON], [EGIDIO, CHARLIE]),
        ],
      },
      // D4 — Best Ball (Charlie → Missouri)
      panmure: {
        format: "bestBall",
        scoring: "gross",
        matches: [
          m([DON, CRAIG], [DAVID, ANGEL]),
          m([AARON, MIKE], [MANOLO, EGIDIO]),
          m([BOBBY, CHARLIE], [RICK]),
        ],
      },
      // D5 — Singles, Net
      dumbarnie: {
        format: "singles",
        scoring: "net",
        matches: [
          m([AARON], [DAVID]),
          m([CRAIG], [MANOLO]),
          m([BOBBY], [EGIDIO]),
          m([MIKE], [RICK]),
          m([DON], [ANGEL]),
        ],
      },
    },
  },
  {
    id: "everyone-every-day",
    name: "B · Everyone Every Day",
    description:
      "Same format mix as A, but singles days run 4 singles + one alternate-shot 2v1 so Charlie plays all 5 days.",
    rounds: {
      // D1 — Singles, Gross (+ alt-shot 2v1)
      lundin: {
        format: "singles",
        scoring: "gross",
        matches: [
          m([DON], [EGIDIO]),
          m([AARON], [RICK]),
          m([CRAIG], [DAVID]),
          m([BOBBY], [ANGEL]),
          m([MIKE, CHARLIE], [MANOLO], "alternateShot"),
        ],
      },
      // D2 — Best Ball (Charlie → Puerto Rico)
      kingsbarns: {
        format: "bestBall",
        scoring: "gross",
        matches: [
          m([DON, AARON], [ANGEL, MANOLO]),
          m([CRAIG, BOBBY], [EGIDIO, RICK]),
          m([MIKE], [DAVID, CHARLIE]),
        ],
      },
      // D3 — Scramble (Charlie → Missouri)
      leven: {
        format: "scramble",
        scoring: "gross",
        matches: [
          m([AARON, CRAIG], [RICK, DAVID]),
          m([BOBBY, MIKE], [ANGEL, MANOLO]),
          m([DON, CHARLIE], [EGIDIO]),
        ],
      },
      // D4 — Best Ball (Charlie → Puerto Rico)
      panmure: {
        format: "bestBall",
        scoring: "gross",
        matches: [
          m([DON, CRAIG], [DAVID, ANGEL]),
          m([AARON, MIKE], [MANOLO, EGIDIO]),
          m([BOBBY], [RICK, CHARLIE]),
        ],
      },
      // D5 — Singles, Net (+ alt-shot 2v1)
      dumbarnie: {
        format: "singles",
        scoring: "net",
        matches: [
          m([AARON], [DAVID]),
          m([CRAIG], [MANOLO]),
          m([BOBBY], [EGIDIO]),
          m([MIKE], [RICK]),
          m([DON, CHARLIE], [ANGEL], "alternateShot"),
        ],
      },
    },
  },
  {
    id: "two-scrambles",
    name: "C · Two Scrambles",
    description:
      "2 singles, 1 best ball, 2 scramble. Charlie plays the three team days; singles days are clean 1v1.",
    rounds: {
      // D1 — Singles, Gross
      lundin: {
        format: "singles",
        scoring: "gross",
        matches: [
          m([DON], [EGIDIO]),
          m([AARON], [RICK]),
          m([CRAIG], [DAVID]),
          m([BOBBY], [ANGEL]),
          m([MIKE], [MANOLO]),
        ],
      },
      // D2 — Scramble (Charlie → Missouri)
      kingsbarns: {
        format: "scramble",
        scoring: "gross",
        matches: [
          m([DON, AARON], [ANGEL, MANOLO]),
          m([CRAIG, BOBBY], [EGIDIO, RICK]),
          m([MIKE, CHARLIE], [DAVID]),
        ],
      },
      // D3 — Best Ball (Charlie → Puerto Rico)
      leven: {
        format: "bestBall",
        scoring: "gross",
        matches: [
          m([AARON, CRAIG], [RICK, DAVID]),
          m([BOBBY, MIKE], [ANGEL, MANOLO]),
          m([DON], [EGIDIO, CHARLIE]),
        ],
      },
      // D4 — Scramble (Charlie → Missouri)
      panmure: {
        format: "scramble",
        scoring: "gross",
        matches: [
          m([DON, CRAIG], [DAVID, ANGEL]),
          m([AARON, MIKE], [MANOLO, EGIDIO]),
          m([BOBBY, CHARLIE], [RICK]),
        ],
      },
      // D5 — Singles, Net
      dumbarnie: {
        format: "singles",
        scoring: "net",
        matches: [
          m([AARON], [DAVID]),
          m([CRAIG], [MANOLO]),
          m([BOBBY], [EGIDIO]),
          m([MIKE], [RICK]),
          m([DON], [ANGEL]),
        ],
      },
    },
  },
  {
    id: "original-proposal",
    name: "D · Original proposal",
    description:
      "The captain's first rotation: 3 singles + 2 best ball, with Charlie as the both-sides floater in the odd match.",
    rounds: {
      lundin: {
        format: "singles",
        scoring: "gross",
        matches: [
          m([DON], [EGIDIO]),
          m([AARON], [RICK]),
          m([CRAIG], [DAVID]),
          m([BOBBY], [ANGEL]),
          m([MIKE], [MANOLO]),
        ],
      },
      kingsbarns: {
        format: "bestBall",
        scoring: "gross",
        matches: [
          m([DON, AARON], [ANGEL, MANOLO]),
          m([CRAIG, BOBBY], [EGIDIO, RICK]),
          m([MIKE, CHARLIE], [DAVID, CHARLIE]),
        ],
      },
      leven: {
        format: "singles",
        scoring: "net",
        matches: [
          m([CRAIG], [EGIDIO]),
          m([AARON], [RICK]),
          m([BOBBY], [DAVID]),
          m([MIKE], [ANGEL]),
          m([DON], [MANOLO]),
        ],
      },
      panmure: {
        format: "bestBall",
        scoring: "gross",
        matches: [
          m([AARON, CRAIG], [RICK, DAVID]),
          m([BOBBY, MIKE], [ANGEL, MANOLO]),
          m([DON, CHARLIE], [EGIDIO, CHARLIE]),
        ],
      },
      dumbarnie: {
        format: "singles",
        scoring: "net",
        matches: [
          m([AARON], [RICK]),
          m([CRAIG], [DAVID]),
          m([BOBBY], [ANGEL]),
          m([MIKE], [MANOLO]),
          m([DON], [EGIDIO]),
        ],
      },
    },
  },
];
