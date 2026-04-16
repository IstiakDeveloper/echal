/* global process */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const inputPath = path.join(projectRoot, 'public', 'logo.png');
const outDir = path.join(projectRoot, 'public', 'pwa');
const iconsDir = path.join(outDir, 'icons');

const sizes = [48, 72, 96, 120, 128, 144, 152, 180, 192, 256, 384, 512];

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

async function exists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    if (!(await exists(inputPath))) {
        throw new Error(`Missing input logo at ${inputPath}`);
    }

    await ensureDir(iconsDir);

    const base = sharp(inputPath).ensureAlpha();

    await Promise.all(
        sizes.map(async (size) => {
            const filename = `icon-${size}x${size}.png`;
            const outPath = path.join(iconsDir, filename);
            await base
                .clone()
                .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png({ compressionLevel: 9 })
                .toFile(outPath);
        }),
    );

    // Maskable icons (adds padding so the logo won't be clipped)
    await Promise.all(
        [192, 512].map(async (size) => {
            const filename = `icon-maskable-${size}x${size}.png`;
            const outPath = path.join(iconsDir, filename);
            const padded = Math.round(size * 0.8);

            await base
                .clone()
                .resize(padded, padded, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .extend({
                    top: Math.floor((size - padded) / 2),
                    bottom: Math.ceil((size - padded) / 2),
                    left: Math.floor((size - padded) / 2),
                    right: Math.ceil((size - padded) / 2),
                    background: { r: 0, g: 0, b: 0, alpha: 0 },
                })
                .png({ compressionLevel: 9 })
                .toFile(outPath);
        }),
    );

    // Common standalone icons
    await base
        .clone()
        .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(path.join(outDir, 'apple-touch-icon.png'));

    await base
        .clone()
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(path.join(outDir, 'favicon-32x32.png'));

    await base
        .clone()
        .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(path.join(outDir, 'favicon-16x16.png'));

    // A simple 512 icon we can reference as "logo"
    await base
        .clone()
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(path.join(outDir, 'logo-512.png'));

    // An optional monochrome-style icon for Windows tiles (best effort)
    await base
        .clone()
        .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .flatten({ background: '#ffffff' })
        .png({ compressionLevel: 9 })
        .toFile(path.join(outDir, 'ms-tile-512.png'));

    console.log(`Generated PWA icons in ${path.relative(projectRoot, outDir)}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
