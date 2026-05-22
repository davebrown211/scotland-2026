import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { HoleScore, IndividualRoundScore, GroupResult } from "./scoring";

// ── Individual Scores ──────────────────────────────────────────────────────────

export async function saveIndividualScore(
  playerId: string,
  roundSlug: string,
  holes: HoleScore,
  grossTotal: number,
  netTotal: number
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  const id = `${playerId}_${roundSlug}`;
  await setDoc(doc(db, "individualScores", id), {
    playerId,
    roundSlug,
    holes,
    grossTotal,
    netTotal,
    submittedAt: Timestamp.now(),
  });
}

export async function getIndividualScores(
  roundSlug?: string
): Promise<IndividualRoundScore[]> {
  if (!isFirebaseConfigured) return [];
  const ref = collection(db, "individualScores");
  const q = roundSlug ? query(ref, where("roundSlug", "==", roundSlug)) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as IndividualRoundScore);
}

export async function deleteIndividualScore(
  playerId: string,
  roundSlug: string
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  await deleteDoc(doc(db, "individualScores", `${playerId}_${roundSlug}`));
}

export async function getPlayerScore(
  playerId: string,
  roundSlug: string
): Promise<IndividualRoundScore | null> {
  if (!isFirebaseConfigured) return null;
  const id = `${playerId}_${roundSlug}`;
  const snap = await getDoc(doc(db, "individualScores", id));
  return snap.exists() ? (snap.data() as IndividualRoundScore) : null;
}

// ── Groups / Match Play ───────────────────────────────────────────────────────

export async function saveGroup(group: GroupResult): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  await setDoc(doc(db, "groups", group.groupId), {
    ...group,
    updatedAt: Timestamp.now(),
  });
}

export async function getGroups(roundSlug?: string): Promise<GroupResult[]> {
  if (!isFirebaseConfigured) return [];
  const ref = collection(db, "groups");
  const q = roundSlug ? query(ref, where("roundSlug", "==", roundSlug)) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as GroupResult);
}

export async function deleteGroup(groupId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  await deleteDoc(doc(db, "groups", groupId));
}

// ── Gallery ───────────────────────────────────────────────────────────────────

export interface GalleryPhoto {
  id: string;
  roundSlug: string | null;
  storageUrl: string;
  caption: string;
  uploadedAt: Timestamp;
}

export async function saveGalleryPhoto(
  id: string,
  roundSlug: string | null,
  storageUrl: string,
  caption: string
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  await setDoc(doc(db, "gallery", id), {
    id,
    roundSlug,
    storageUrl,
    caption,
    uploadedAt: Timestamp.now(),
  });
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  await deleteDoc(doc(db, "gallery", id));
}

export async function getGalleryPhotos(
  roundSlug?: string | null
): Promise<GalleryPhoto[]> {
  if (!isFirebaseConfigured) return [];
  const ref = collection(db, "gallery");
  const q =
    roundSlug != null
      ? query(ref, where("roundSlug", "==", roundSlug))
      : ref;
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as GalleryPhoto)
    .sort((a, b) => b.uploadedAt.toMillis() - a.uploadedAt.toMillis());
}
