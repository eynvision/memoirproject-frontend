"use client";

/**
 * Shrinks photographs in the browser before they are uploaded.
 *
 * Phone cameras routinely produce 4–8 MB files; a memoir card never needs
 * more than ~2000px on the long edge. Compressing here cuts upload time far
 * more than any server-side change can, because the bytes never leave the
 * device in the first place.
 *
 * Every failure path returns the original file, so a compression problem can
 * never block a submission.
 */

import imageCompression from "browser-image-compression";

const SKIP_BELOW_BYTES = 600 * 1024; // already small enough
const MAX_SIZE_MB = 1.2;
const MAX_LONG_EDGE_PX = 2000;

export async function compressImage(file: File): Promise<File> {
  if (file.size <= SKIP_BELOW_BYTES) return file;
  if (!file.type.startsWith("image/")) return file;

  try {
    const output = await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_LONG_EDGE_PX,
      useWebWorker: true,
      fileType: file.type, // keep JPEG as JPEG, PNG as PNG, WebP as WebP
      initialQuality: 0.85,
    });

    // The library returns a Blob-like File; normalise so `name` and `type`
    // are guaranteed for the presign request.
    return new File([output], file.name, {
      type: output.type || file.type,
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}