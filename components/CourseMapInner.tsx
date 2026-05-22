"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { COURSES, HOME_BASE } from "@/data/courses";
import Link from "next/link";
import { useEffect } from "react";

// Fix Leaflet default icon paths broken by webpack
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const homeIcon = new L.DivIcon({
  html: `<div style="
    background:#1a3c2b;
    color:#F5C842;
    width:36px;height:36px;
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:18px;
    border:3px solid #F5C842;
    box-shadow:0 2px 6px rgba(0,0,0,0.4);
  ">🏨</div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

function makeCourseIcon(roundNumber: number) {
  return new L.DivIcon({
    html: `<div style="
      background:#F5C842;
      color:#1a3c2b;
      width:32px;height:32px;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
      font-weight:700;
      font-family:sans-serif;
      border:3px solid #1a3c2b;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${roundNumber}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

export default function CourseMapInner() {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer
      center={[56.3397, -2.7967]}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Hotel / home base */}
      <Marker position={[HOME_BASE.coordinates.lat, HOME_BASE.coordinates.lng]} icon={homeIcon}>
        <Popup>
          <div className="text-center">
            <p className="font-bold text-[#1a3c2b]">{HOME_BASE.name}</p>
            <p className="text-xs text-gray-500">Home Base · St. Andrews</p>
          </div>
        </Popup>
      </Marker>

      {/* Golf courses */}
      {COURSES.map((course, i) => (
        <Marker
          key={course.slug}
          position={[course.coordinates.lat, course.coordinates.lng]}
          icon={makeCourseIcon(i + 1)}
        >
          <Popup>
            <div className="text-center min-w-[160px]">
              <p className="font-bold text-[#1a3c2b] text-sm">Round {i + 1}</p>
              <p className="font-semibold text-sm">{course.name}</p>
              <p className="text-xs text-gray-500 mb-2">
                {new Date(course.date + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric"
                })}
                {" · "}Tee {course.teeTime}
              </p>
              <Link
                href={`/course/${course.slug}`}
                className="text-xs bg-[#1a3c2b] text-white px-3 py-1 rounded hover:bg-[#2d6147] transition-colors"
              >
                View Scores →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
