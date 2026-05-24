#!/usr/bin/env node
/**
 * Generate PWA icons from the hero photo.
 *
 * Output:
 *   public/icons/icon-192.png        — basic homescreen icon
 *   public/icons/icon-512.png        — splash + larger homescreen
 *   public/icons/icon-maskable-512.png — Android adaptive (safe area)
 *   public/icons/apple-touch-icon.png — 180x180 for iOS
 *
 * Background: deep slate (#020617) matching the rest of the dark
 * cosmic theme — the source photo is on a white-balanced background
 * so we composite onto dark to match the installed-app surface.
 *
 * Run: yarn pwa:icons
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'app/assets/img/iam-wb-1.png');
const OUT_DIR = resolve(ROOT, 'public/icons');

const BG = '#020617'; // slate-950 — same as site bg
const ICONS = [
  { name: 'icon-192.png', size: 192, safeArea: 1.0 },
  { name: 'icon-512.png', size: 512, safeArea: 1.0 },
  // Maskable: keep the subject inside a 80% inner circle so Android's
  // arbitrary mask crops can't clip the face.
  { name: 'icon-maskable-512.png', size: 512, safeArea: 0.8 },
  { name: 'apple-touch-icon.png', size: 180, safeArea: 1.0 },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const srcBuf = await sharp(SRC)
    .resize(1024, 1024, { fit: 'contain', background: BG })
    .png()
    .toBuffer();

  for (const { name, size, safeArea } of ICONS) {
    const innerSize = Math.round(size * safeArea);
    const inner = await sharp(srcBuf)
      .resize(innerSize, innerSize, { fit: 'contain', background: BG })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: BG,
      },
    })
      .composite([
        {
          input: inner,
          gravity: 'center',
        },
      ])
      .png({ quality: 90 })
      .toFile(resolve(OUT_DIR, name));
    console.log(`✓ ${name} (${size}×${size}, safe area ${safeArea * 100}%)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
