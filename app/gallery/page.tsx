"use client";

import { useState, useEffect } from "react";
import { COURSES } from "@/data/courses";
import { GalleryPhoto } from "@/lib/firestore";
import Link from "next/link";

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [filterRound, setFilterRound] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth").then((r) => { if (r.ok) setIsAdmin(true); });
  }, []);

  useEffect(() => {
    const url = filterRound ? `/api/gallery?round=${filterRound}` : "/api/gallery";
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setPhotos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterRound]);

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!confirm("Delete this photo?")) return;
    setDeleting(photo.id);
    const res = await fetch("/api/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id }),
    });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      if (lightbox?.id === photo.id) setLightbox(null);
    }
    setDeleting(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-[#1a3c2b] font-bold">Photo Gallery</h1>
          <p className="text-gray-500 text-sm mt-1">Scotland Golf Trip 2026</p>
        </div>
        <Link
          href="/admin?tab=gallery"
          className="bg-[#1a3c2b] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2d6147] transition-colors"
        >
          Upload Photos
        </Link>
      </div>

      {/* Filter by round */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterRound("")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filterRound === ""
              ? "bg-[#1a3c2b] text-white"
              : "border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All Photos
        </button>
        {COURSES.map((c, i) => (
          <button
            key={c.slug}
            onClick={() => setFilterRound(c.slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterRound === c.slug
                ? "bg-[#1a3c2b] text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            R{i + 1} · {c.name.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading photos…</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📸</p>
          <p className="font-serif text-xl text-gray-500">No photos yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Team captains can upload photos from the Admin panel.
          </p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {photos.map((photo) => {
            const course = COURSES.find((c) => c.slug === photo.roundSlug);
            return (
              <div
                key={photo.id}
                className="break-inside-avoid bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow group relative"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.storageUrl}
                  alt={photo.caption || "Scotland trip photo"}
                  className="w-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onClick={() => setLightbox(photo)}
                />
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(photo)}
                    disabled={deleting === photo.id}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Delete photo"
                  >
                    {deleting === photo.id ? "…" : "✕"}
                  </button>
                )}
                {(photo.caption || course) && (
                  <div className="px-3 py-2">
                    {photo.caption && (
                      <p className="text-xs text-gray-700 font-medium">{photo.caption}</p>
                    )}
                    {course && (
                      <p className="text-xs text-gray-400 mt-0.5">{course.name}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.storageUrl}
              alt={lightbox.caption || "Scotland trip photo"}
              className="max-h-[80vh] w-full object-contain"
            />
            {(lightbox.caption || isAdmin) && (
              <div className="px-4 py-3 bg-white flex items-center justify-between gap-4">
                {lightbox.caption
                  ? <p className="text-sm text-gray-700">{lightbox.caption}</p>
                  : <span />
                }
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(lightbox)}
                    className="shrink-0 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1 rounded transition-colors"
                  >
                    Delete photo
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
