"use client";

import dynamic from "next/dynamic";

// Leaflet must be loaded client-side only
const MapInner = dynamic(() => import("./CourseMapInner"), { ssr: false });

export default function CourseMap() {
  return (
    <div className="h-96 rounded-lg overflow-hidden shadow-md">
      <MapInner />
    </div>
  );
}
