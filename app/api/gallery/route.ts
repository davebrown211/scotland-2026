import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "@/lib/auth";
import { saveGalleryPhoto, getGalleryPhotos, deleteGalleryPhoto } from "@/lib/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const roundSlug = req.nextUrl.searchParams.get("round");
  const photos = await getGalleryPhotos(roundSlug ?? undefined);
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || !isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) ?? "";
  const roundSlug = (formData.get("roundSlug") as string) ?? null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const id = randomUUID();
  const ext = file.name.split(".").pop() ?? "jpg";
  const storageRef = ref(storage, `gallery/${id}.${ext}`);

  const bytes = await file.arrayBuffer();
  await uploadBytes(storageRef, new Uint8Array(bytes), {
    contentType: file.type,
  });
  const url = await getDownloadURL(storageRef);

  await saveGalleryPhoto(id, roundSlug || null, url, caption);
  return NextResponse.json({ ok: true, url });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || !isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await deleteGalleryPhoto(id);
  return NextResponse.json({ ok: true });
}
