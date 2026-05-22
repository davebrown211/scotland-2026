"use client";

import { useState, useRef } from "react";
import { COURSES } from "@/data/courses";

export default function GalleryUpload() {
  const [roundSlug, setRoundSlug] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);
    if (roundSlug) formData.append("roundSlug", roundSlug);

    try {
      const res = await fetch("/api/gallery", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Photo uploaded successfully!" });
        setFile(null);
        setPreview(null);
        setCaption("");
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setMessage({ type: "error", text: data.error ?? "Upload failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setUploading(false);
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Round (optional)</label>
        <select
          value={roundSlug}
          onChange={(e) => setRoundSlug(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">— General / Not round-specific —</option>
          {COURSES.map((c, i) => (
            <option key={c.slug} value={c.slug}>
              Round {i + 1} — {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#1a3c2b] file:text-white file:text-sm file:font-medium hover:file:bg-[#2d6147]"
        />
      </div>

      {preview && (
        <div className="rounded-lg overflow-hidden border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-[#1a3c2b] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#2d6147] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading…" : "Upload Photo"}
      </button>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
