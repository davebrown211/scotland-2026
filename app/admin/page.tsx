"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PasswordGate from "@/components/admin/PasswordGate";
import IndividualScoreEntry from "@/components/admin/IndividualScoreEntry";
import GroupScoreEntry from "@/components/admin/GroupScoreEntry";
import PairingsEditor from "@/components/admin/PairingsEditor";
import GalleryUpload from "@/components/admin/GalleryUpload";

type Tab = "pairings" | "individual" | "groups" | "gallery";

function AdminPageInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "individual";

  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => { if (r.ok) setAuthenticated(true); })
      .finally(() => setChecking(false));
  }, []);

  if (checking) return null;

  if (!authenticated) {
    return <PasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "pairings", label: "Pairings", emoji: "🗂️" },
    { id: "individual", label: "Individual Scores", emoji: "🏌️" },
    { id: "groups", label: "Match Play", emoji: "⚔️" },
    { id: "gallery", label: "Upload Photos", emoji: "📸" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[#1a3c2b] font-bold">Score Entry</h1>
          <p className="text-gray-500 text-sm mt-1">Team captains portal</p>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/auth", { method: "DELETE" });
            setAuthenticated(false);
          }}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white shadow text-[#1a3c2b]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {activeTab === "pairings" && (
          <>
            <h2 className="font-serif text-xl text-[#1a3c2b] font-semibold mb-4">
              Pairings & Matchups
            </h2>
            <PairingsEditor />
          </>
        )}
        {activeTab === "individual" && (
          <>
            <h2 className="font-serif text-xl text-[#1a3c2b] font-semibold mb-4">
              Individual Score Entry
            </h2>
            <IndividualScoreEntry />
          </>
        )}
        {activeTab === "groups" && (
          <>
            <h2 className="font-serif text-xl text-[#1a3c2b] font-semibold mb-4">
              Match Play Groups
            </h2>
            <GroupScoreEntry />
          </>
        )}
        {activeTab === "gallery" && (
          <>
            <h2 className="font-serif text-xl text-[#1a3c2b] font-semibold mb-4">
              Upload Photos
            </h2>
            <GalleryUpload />
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminPageInner />
    </Suspense>
  );
}
