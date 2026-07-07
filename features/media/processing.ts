import "server-only";

import { execFile } from "child_process";
import { mkdtemp, readFile, rm, unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

const MAX_IMAGE_BYTES = 1024 * 1024;
const MAX_VIDEO_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 60;

function assertUploadedFile(file: FormDataEntryValue | null, label: string): File {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error(`Selecciona ${label}.`);
  }
  return file;
}

export function getUploadedImage(file: FormDataEntryValue | null) {
  return assertUploadedFile(file, "una imagen");
}

export function getUploadedVideo(file: FormDataEntryValue | null) {
  return assertUploadedFile(file, "un video");
}

export async function compressImageToWebp(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  const widths = [1920, 1600, 1280, 1024, 800, 640];
  const qualities = [82, 74, 66, 58, 50, 42, 34, 28];
  let smallest: Buffer | null = null;

  for (const width of widths) {
    for (const quality of qualities) {
      const output = await sharp(input)
        .rotate()
        .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();

      if (!smallest || output.length < smallest.length) smallest = output;
      if (output.length <= MAX_IMAGE_BYTES) return output;
    }
  }

  if (smallest && smallest.length <= MAX_IMAGE_BYTES) return smallest;
  throw new Error("No se pudo comprimir la imagen por debajo de 1MB.");
}

async function probeVideoDuration(inputPath: string) {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    inputPath,
  ]);
  const duration = Number(String(stdout).trim());
  return Number.isFinite(duration) && duration > 0 ? Math.min(duration, MAX_VIDEO_SECONDS) : MAX_VIDEO_SECONDS;
}

export async function compressVideoToWebm(file: File) {
  const workdir = await mkdtemp(join(tmpdir(), "atomo-media-"));
  const inputPath = join(workdir, "input");
  await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

  try {
    const duration = await probeVideoDuration(inputPath);
    const attempts = [
      { width: 1280, height: 720, audioKbps: 64, budget: 0.88 },
      { width: 960, height: 540, audioKbps: 56, budget: 0.78 },
      { width: 720, height: 480, audioKbps: 48, budget: 0.68 },
      { width: 540, height: 360, audioKbps: 40, budget: 0.58 },
    ];
    let smallest: Buffer | null = null;

    for (const [index, attempt] of attempts.entries()) {
      const outputPath = join(workdir, `output-${index}.webm`);
      const totalKbps = Math.floor((MAX_VIDEO_BYTES * 8 * attempt.budget) / duration / 1024);
      const videoKbps = Math.max(180, totalKbps - attempt.audioKbps);

      await execFileAsync("ffmpeg", [
        "-y",
        "-i",
        inputPath,
        "-t",
        String(duration),
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-vf",
        `scale=${attempt.width}:${attempt.height}:force_original_aspect_ratio=decrease`,
        "-c:v",
        "libvpx-vp9",
        "-b:v",
        `${videoKbps}k`,
        "-deadline",
        "good",
        "-cpu-used",
        "4",
        "-row-mt",
        "1",
        "-c:a",
        "libopus",
        "-b:a",
        `${attempt.audioKbps}k`,
        outputPath,
      ]);

      const output = await readFile(outputPath);
      await unlink(outputPath).catch(() => undefined);
      if (!smallest || output.length < smallest.length) smallest = output;
      if (output.length <= MAX_VIDEO_BYTES) return output;
    }

    if (smallest && smallest.length <= MAX_VIDEO_BYTES) return smallest;
    throw new Error("No se pudo comprimir el video por debajo de 10MB.");
  } finally {
    await rm(workdir, { force: true, recursive: true });
  }
}
