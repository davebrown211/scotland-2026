export interface HoleInfo {
  hole: number;
  par: number;
  yards: number;
  strokeIndex: number; // 1 = hardest, 18 = easiest
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  clubName: string;
  date: string; // ISO date string
  teeTime: string;
  teeColor: string;
  totalYards: number;
  totalPar: number;
  courseRating: number;
  slopeRating: number;
  description: string;
  clubhouseTip: string;
  driveFromStAndrews: string; // e.g. "~20 min"
  holes: HoleInfo[];
  coordinates: { lat: number; lng: number };
  unsplashQuery: string; // for hero image fallback
}

export const COURSES: Course[] = [
  {
    id: "lundin",
    slug: "lundin",
    name: "Lundin Golf Course",
    clubName: "Lundin Golf Club",
    date: "2026-07-12",
    teeTime: "11:32",
    teeColor: "Yellow",
    totalYards: 6138,
    totalPar: 71,
    courseRating: 70.2,
    slopeRating: 130,
    description:
      "Renowned for its beautiful lush green fairways, this James Braid design has some of the most demanding short par-4s in the region. Founded in 1868, it has been consistently selected as a final qualifying golf course for the Open Championship.",
    clubhouseTip: "The clubhouse kitchen under Chef Abbie earns rave reviews — the fish & chips is the must-order. Bar stocks single malts and Pilgrims Gin from St Andrews. For a proper session afterwards, walk a mile to the Railway Inn in Lower Largo: CAMRA Fife Pub of the Year (est. 1749), Belhaven Best and rotating real ales on tap, plus pies and toasties.",
    driveFromStAndrews: "~20 min",
    coordinates: { lat: 56.2133, lng: -2.9612 },
    unsplashQuery: "Lundin Links golf course Scotland",
    holes: [
      { hole: 1,  par: 4, yards: 403, strokeIndex: 5  },
      { hole: 2,  par: 4, yards: 339, strokeIndex: 11 },
      { hole: 3,  par: 4, yards: 312, strokeIndex: 14 },
      { hole: 4,  par: 4, yards: 415, strokeIndex: 1  },
      { hole: 5,  par: 3, yards: 128, strokeIndex: 18 },
      { hole: 6,  par: 4, yards: 325, strokeIndex: 9  },
      { hole: 7,  par: 4, yards: 266, strokeIndex: 16 },
      { hole: 8,  par: 4, yards: 355, strokeIndex: 7  },
      { hole: 9,  par: 5, yards: 546, strokeIndex: 3  },
      { hole: 10, par: 4, yards: 348, strokeIndex: 10 },
      { hole: 11, par: 4, yards: 447, strokeIndex: 2  },
      { hole: 12, par: 3, yards: 140, strokeIndex: 17 },
      { hole: 13, par: 5, yards: 490, strokeIndex: 8  },
      { hole: 14, par: 3, yards: 170, strokeIndex: 15 },
      { hole: 15, par: 4, yards: 417, strokeIndex: 4  },
      { hole: 16, par: 4, yards: 280, strokeIndex: 13 },
      { hole: 17, par: 4, yards: 330, strokeIndex: 12 },
      { hole: 18, par: 4, yards: 427, strokeIndex: 6  },
    ],
  },
  {
    id: "kingsbarns",
    slug: "kingsbarns",
    name: "Kingsbarns Golf Links",
    clubName: "Kingsbarns Golf Links",
    date: "2026-07-13",
    teeTime: "08:40",
    teeColor: "Yellow/Green",
    totalYards: 6356,
    totalPar: 72,
    courseRating: 71.1,
    slopeRating: 132,
    description:
      "A classic example of a Scottish links course, Kingsbarns Golf Links was originally founded back in the 18th Century. Characterised by its outstanding coastal views, deadly pot bunkers, undulating fairways and tight greens.",
    clubhouseTip: "Order the Kingsbarns Dream to Dram whisky (£5.95) — distilled next door from local Fife barley and named World's Best Lowland Single Malt 2020. House Cundie Lager and Belhaven Best on tap. Food standouts: haggis fritters (£8.95) and smoked haddock chowder (£9.95). Hot food also available at the Bunker Barn halfway house at the turn.",
    driveFromStAndrews: "~15 min",
    coordinates: { lat: 56.298, lng: -2.647 },
    unsplashQuery: "Kingsbarns golf links Scotland coastal",
    holes: [
      { hole: 1,  par: 4, yards: 354, strokeIndex: 13 },
      { hole: 2,  par: 3, yards: 165, strokeIndex: 17 },
      { hole: 3,  par: 5, yards: 485, strokeIndex: 7  },
      { hole: 4,  par: 4, yards: 370, strokeIndex: 5  },
      { hole: 5,  par: 4, yards: 388, strokeIndex: 1  },
      { hole: 6,  par: 4, yards: 298, strokeIndex: 11 },
      { hole: 7,  par: 4, yards: 415, strokeIndex: 3  },
      { hole: 8,  par: 3, yards: 142, strokeIndex: 15 },
      { hole: 9,  par: 5, yards: 496, strokeIndex: 9  },
      { hole: 10, par: 4, yards: 339, strokeIndex: 14 },
      { hole: 11, par: 4, yards: 410, strokeIndex: 2  },
      { hole: 12, par: 5, yards: 531, strokeIndex: 12 },
      { hole: 13, par: 3, yards: 118, strokeIndex: 18 },
      { hole: 14, par: 4, yards: 348, strokeIndex: 8  },
      { hole: 15, par: 3, yards: 165, strokeIndex: 16 },
      { hole: 16, par: 5, yards: 502, strokeIndex: 6  },
      { hole: 17, par: 4, yards: 420, strokeIndex: 4  },
      { hole: 18, par: 4, yards: 405, strokeIndex: 10 },
    ],
  },
  {
    id: "leven",
    slug: "leven",
    name: "Leven Links Golf Course",
    clubName: "Leven Links Golf Club",
    date: "2026-07-15",
    teeTime: "09:45",
    teeColor: "Yellow",
    totalYards: 6309,
    totalPar: 70,
    courseRating: 71.4,
    slopeRating: 129,
    description:
      "Dating back to the 1800s, this is one of the oldest links courses in Scotland and thought to be the very first course in the world to feature 18 tees and 18 separate greens.",
    clubhouseTip: "Two member clubhouses — Leven Golfing Society and Leven Thistle — both welcome visitors and both have bars and kitchens. The Cullen Skink (smoked haddock soup) draws raves from visiting golfers; the LGS daily blackboard also runs burgers, toasties, and a chef's special. Good single malt selection at both bars.",
    driveFromStAndrews: "~23 min",
    coordinates: { lat: 56.1982, lng: -2.9883 },
    unsplashQuery: "Leven Links golf Scotland links course",
    holes: [
      { hole: 1,  par: 4, yards: 407, strokeIndex: 10 },
      { hole: 2,  par: 4, yards: 361, strokeIndex: 8  },
      { hole: 3,  par: 4, yards: 339, strokeIndex: 16 },
      { hole: 4,  par: 4, yards: 435, strokeIndex: 2  },
      { hole: 5,  par: 3, yards: 148, strokeIndex: 18 },
      { hole: 6,  par: 5, yards: 542, strokeIndex: 4  },
      { hole: 7,  par: 3, yards: 164, strokeIndex: 14 },
      { hole: 8,  par: 4, yards: 335, strokeIndex: 6  },
      { hole: 9,  par: 3, yards: 156, strokeIndex: 12 },
      { hole: 10, par: 4, yards: 328, strokeIndex: 11 },
      { hole: 11, par: 4, yards: 352, strokeIndex: 17 },
      { hole: 12, par: 4, yards: 444, strokeIndex: 1  },
      { hole: 13, par: 4, yards: 464, strokeIndex: 3  },
      { hole: 14, par: 4, yards: 346, strokeIndex: 15 },
      { hole: 15, par: 3, yards: 171, strokeIndex: 7  },
      { hole: 16, par: 4, yards: 381, strokeIndex: 13 },
      { hole: 17, par: 4, yards: 401, strokeIndex: 5  },
      { hole: 18, par: 4, yards: 435, strokeIndex: 9  },
    ],
  },
  {
    id: "panmure",
    slug: "panmure",
    name: "Panmure Golf Course",
    clubName: "Panmure Golf Club",
    date: "2026-07-16",
    teeTime: "10:10",
    teeColor: "Yellow",
    totalYards: 5684,
    totalPar: 70,
    courseRating: 69.1,
    slopeRating: 125,
    description:
      "Founded in 1845, this is where Ben Hogan spent two weeks practicing his links game before his only Open Championship in 1953, which he won by 4 shots next door at Carnoustie. Known for its excellent greens.",
    clubhouseTip: "Every visitor gets a complimentary dram of Kümmel — the caraway-anise liqueur that has been poured at Panmure for generations, nicknamed \"putt juice.\" The 19th Hole bar also has a great malt selection. For a proper pub crawl afterwards, head 2 miles to the Station Hotel in Carnoustie: rotating guest ales, whisky flights covering all four Scottish regions, and a legendary steak pie.",
    driveFromStAndrews: "~40 min",
    coordinates: { lat: 56.4868, lng: -2.7405 },
    unsplashQuery: "Panmure golf club Scotland links",
    holes: [
      { hole: 1,  par: 4, yards: 284, strokeIndex: 15 },
      { hole: 2,  par: 5, yards: 438, strokeIndex: 9  },
      { hole: 3,  par: 4, yards: 361, strokeIndex: 3  },
      { hole: 4,  par: 4, yards: 367, strokeIndex: 7  },
      { hole: 5,  par: 3, yards: 124, strokeIndex: 17 },
      { hole: 6,  par: 4, yards: 341, strokeIndex: 1  },
      { hole: 7,  par: 4, yards: 381, strokeIndex: 11 },
      { hole: 8,  par: 4, yards: 312, strokeIndex: 5  },
      { hole: 9,  par: 3, yards: 149, strokeIndex: 13 },
      { hole: 10, par: 4, yards: 355, strokeIndex: 4  },
      { hole: 11, par: 3, yards: 138, strokeIndex: 18 },
      { hole: 12, par: 4, yards: 332, strokeIndex: 8  },
      { hole: 13, par: 4, yards: 350, strokeIndex: 14 },
      { hole: 14, par: 5, yards: 482, strokeIndex: 2  },
      { hole: 15, par: 3, yards: 201, strokeIndex: 10 },
      { hole: 16, par: 4, yards: 342, strokeIndex: 16 },
      { hole: 17, par: 4, yards: 362, strokeIndex: 6  },
      { hole: 18, par: 4, yards: 385, strokeIndex: 12 },
    ],
  },
  {
    id: "dumbarnie",
    slug: "dumbarnie",
    name: "Dumbarnie Links",
    clubName: "Dumbarnie Links",
    date: "2026-07-17",
    teeTime: "09:50",
    teeColor: "Yellow/Forward",
    totalYards: 5424,
    totalPar: 72,
    courseRating: 66.8,
    slopeRating: 119,
    description:
      "Just minutes from St Andrews, this rare piece of land has a mile and a half of sea frontage with panoramic views over the Firth of Forth. Features three potentially driveable Par-4s and several risk-and-reward holes.",
    clubhouseTip: "The Old Barn Bar has their own-label Dumbarnie Links 10-year-old single malt from Loch Lomond — smooth with orange peel and a smoky finish, exclusive to the club. House lager brewed by St Andrews Brewing Co on tap. Must-orders: Cullen Skink to start, then the fish & chips or Old Barn Burger. South-facing terrace overlooks the 1st hole and the Firth of Forth.",
    driveFromStAndrews: "~20 min",
    coordinates: { lat: 56.2127, lng: -2.885 },
    unsplashQuery: "Dumbarnie Links golf Firth of Forth Scotland",
    holes: [
      { hole: 1,  par: 4, yards: 312, strokeIndex: 6  },
      { hole: 2,  par: 5, yards: 418, strokeIndex: 8  },
      { hole: 3,  par: 4, yards: 255, strokeIndex: 18 },
      { hole: 4,  par: 4, yards: 288, strokeIndex: 10 },
      { hole: 5,  par: 4, yards: 322, strokeIndex: 2  },
      { hole: 6,  par: 3, yards: 115, strokeIndex: 12 },
      { hole: 7,  par: 5, yards: 435, strokeIndex: 16 },
      { hole: 8,  par: 3, yards: 102, strokeIndex: 14 },
      { hole: 9,  par: 4, yards: 312, strokeIndex: 4  },
      { hole: 10, par: 4, yards: 378, strokeIndex: 1  },
      { hole: 11, par: 4, yards: 215, strokeIndex: 13 },
      { hole: 12, par: 4, yards: 294, strokeIndex: 15 },
      { hole: 13, par: 5, yards: 448, strokeIndex: 3  },
      { hole: 14, par: 3, yards: 123, strokeIndex: 17 },
      { hole: 15, par: 5, yards: 490, strokeIndex: 9  },
      { hole: 16, par: 3, yards: 131, strokeIndex: 7  },
      { hole: 17, par: 4, yards: 264, strokeIndex: 11 },
      { hole: 18, par: 4, yards: 352, strokeIndex: 5  },
    ],
  },
];

export const HOME_BASE = {
  name: "Hotel du Vin St. Andrews",
  coordinates: { lat: 56.3397, lng: -2.7967 },
};

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getCourseByRound(roundNumber: number): Course | undefined {
  return COURSES[roundNumber - 1];
}
