import { notFound } from "next/navigation";
import { getCourse, COURSES } from "@/data/courses";
import { PLAYERS } from "@/data/players";
import { getIndividualScores, getGroups } from "@/lib/firestore";
import {
  buildIndividualLeaderboard,
  buildTeamStandings,
} from "@/lib/scoring";
import HeroBanner from "@/components/HeroBanner";
import CourseContent from "@/components/CourseContent";

// Official course photography — verified accessible July 2026
const COURSE_IMAGES: Record<string, string> = {
  lundin:    "https://lundingolfclub.co.uk/wp-content/uploads/2023/09/xHero-Img-1.jpg.pagespeed.ic.1lowonivEn.jpg",
  kingsbarns:"https://images.squarespace-cdn.com/content/v1/6710e3464bdab217a2de96d7/577c6c5e-0c89-4f44-9348-ae28dcae5971/Kingsbarns+Pan+Clubhouse+%26+Course+Low+Res.jpg",
  leven:     "https://www.leven-links.com/wp-content/uploads/2020/03/Leven-Links-PGS-34-scaled.jpg",
  panmure:   "https://clubv1.blob.core.windows.net/clubsite-media/165/0e7830370b0a-panmure.03.09.20.mkiii.13.jpg",
  dumbarnie: "https://www.dumbarnielinks.com/wp-content/uploads/sites/8984/2024/02/9th-side-view-to-sea-July-2022-Patrick-Koenig.jpg",
};

export const revalidate = 60;

export async function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const roundNumber = COURSES.findIndex((c) => c.slug === slug) + 1;

  const [allScores, groups] = await Promise.all([
    getIndividualScores(slug),
    getGroups(slug),
  ]).catch(() => [[], []]);

  const totals = buildIndividualLeaderboard(allScores, PLAYERS);
  const standings = buildTeamStandings(groups);

  const imageUrl = COURSE_IMAGES[slug] ?? COURSE_IMAGES.kingsbarns;

  return (
    <>
      <HeroBanner
        title={course.name}
        subtitle={`Round ${roundNumber} · ${new Date(course.date + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric", year: "numeric",
        })} · Tee ${course.teeTime}`}
        detail={`🚗 ${course.driveFromStAndrews} from St. Andrews`}
        imageUrl={imageUrl}
        height="md"
      />

      {/* Course info strip */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Par <strong className="text-[#1a3c2b]">{course.totalPar}</strong></span>
            <span>Yards <strong className="text-[#1a3c2b]">{course.totalYards.toLocaleString()}</strong></span>
            <span>Rating <strong className="text-[#1a3c2b]">{course.courseRating}</strong></span>
            <span>Slope <strong className="text-[#1a3c2b]">{course.slopeRating}</strong></span>
            <span>Tees <strong className="text-[#1a3c2b]">{course.teeColor}</strong></span>
          </div>
          {course.description && (
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">{course.description}</p>
          )}
          {course.clubhouseTip && (
            <div className="mt-2 flex gap-2 text-sm text-gray-600 bg-[#fffbea] border border-[#d4a82a]/40 rounded-md px-3 py-2">
              <span className="text-base shrink-0">🍺</span>
              <p className="leading-relaxed">{course.clubhouseTip}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabbed content — client component */}
      <CourseContent
        courseName={course.name}
        totals={totals}
        standings={standings}
        allScores={allScores}
        groups={groups}
        players={PLAYERS}
        holes={course.holes}
      />
    </>
  );
}
