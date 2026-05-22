import CourseMap from "@/components/CourseMap";
import { COURSES, HOME_BASE } from "@/data/courses";
import Link from "next/link";

export default function MapPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-[#1a3c2b] font-bold">Course Map</h1>
        <p className="text-gray-500 text-sm mt-1">
          Based at {HOME_BASE.name} · St. Andrews, Fife
        </p>
      </div>

      <CourseMap />

      {/* Course legend */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-[#1a3c2b] text-sm mb-3">Course Directory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Home base */}
          <div className="flex items-start gap-3 p-2 rounded bg-[#1a3c2b]/5">
            <span className="text-xl">🏨</span>
            <div>
              <div className="font-semibold text-sm">{HOME_BASE.name}</div>
              <div className="text-xs text-gray-500">Home Base · St. Andrews</div>
            </div>
          </div>

          {COURSES.map((course, i) => (
            <Link
              key={course.slug}
              href={`/course/${course.slug}`}
              className="flex items-start gap-3 p-2 rounded hover:bg-[#F5C842]/20 transition-colors group"
            >
              <span className="text-xl">⛳</span>
              <div>
                <div className="font-semibold text-sm text-[#1a3c2b] group-hover:underline">
                  Round {i + 1}: {course.name}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(course.date + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                  {" · "}Tee {course.teeTime} · Par {course.totalPar}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
