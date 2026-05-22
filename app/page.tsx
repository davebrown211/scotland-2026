import HeroBanner from "@/components/HeroBanner";
import IndividualLeaderboard from "@/components/IndividualLeaderboard";
import TeamLeaderboard from "@/components/TeamLeaderboard";
import CourseMap from "@/components/CourseMap";
import { getIndividualScores, getGroups } from "@/lib/firestore";
import {
  buildIndividualLeaderboard,
  buildTeamStandings,
} from "@/lib/scoring";
import { PLAYERS } from "@/data/players";
import { COURSES } from "@/data/courses";
import Link from "next/link";

// Revalidate every 60 seconds so leaderboards stay fresh
export const revalidate = 60;

// St Andrews Old Course — Ryan Caven / Unsplash (Old Course Hotel visible in background)
const ST_ANDREWS_IMAGE =
  "https://images.unsplash.com/photo-1687291134252-c2bc3b6e0efc?w=1400&q=80";

export default async function HomePage() {
  const [scores, groups] = await Promise.all([
    getIndividualScores(),
    getGroups(),
  ]).catch(() => [[], []]);

  const totals = buildIndividualLeaderboard(scores, PLAYERS);
  const standings = buildTeamStandings(groups);

  return (
    <>
      <HeroBanner
        title="Scotland Golf Trip 2026"
        subtitle="Hotel du Vin St. Andrews · July 12–17"
        imageUrl={ST_ANDREWS_IMAGE}
        height="lg"
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Round schedule cards */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a3c2b] font-semibold mb-4">
            The Schedule
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {COURSES.map((course, i) => (
              <Link
                key={course.slug}
                href={`/course/${course.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border-t-4 border-[#1a3c2b] p-3 group"
              >
                <div className="text-xs text-gray-500 font-medium mb-1">
                  Round {i + 1} ·{" "}
                  {new Date(course.date + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="font-serif text-sm font-semibold text-[#1a3c2b] group-hover:text-[#2d6147] leading-tight">
                  {course.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Tee {course.teeTime} · Par {course.totalPar}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Leaderboards */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IndividualLeaderboard totals={totals} showRoundColumns />
          </div>
          <div>
            <TeamLeaderboard standings={standings} />
          </div>
        </section>

        {/* Map */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a3c2b] font-semibold mb-4">
            Course Map
          </h2>
          <CourseMap />
        </section>
      </div>
    </>
  );
}
