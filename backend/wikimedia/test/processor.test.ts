import { describe, it, expect, vi } from 'vitest';
import sharp from 'sharp';
import { processImage, fetchImage } from '../processor';

async function makeTestImage(
  width: number,
  height: number,
  format: 'png' | 'jpeg' = 'png',
): Promise<Buffer> {
  const pipeline = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 100, g: 150, b: 200 },
    },
  });
  return format === 'png' ? await pipeline.png().toBuffer() : await pipeline.jpeg().toBuffer();
}

describe('processImage', () => {
  it('produces a WebP buffer', async () => {
    const input = await makeTestImage(800, 600);
    const result = await processImage(input);
    expect(result.format).toBe('webp');
    // WebP-magic-bytes: "RIFF....WEBP"
    expect(result.buffer.subarray(0, 4).toString()).toBe('RIFF');
    expect(result.buffer.subarray(8, 12).toString()).toBe('WEBP');
  });

  it('resizes large images to fit within 1280×720 by default', async () => {
    const input = await makeTestImage(2400, 1800);
    const result = await processImage(input);
    expect(result.width).toBeLessThanOrEqual(1280);
    expect(result.height).toBeLessThanOrEqual(720);
  });

  it('preserves aspect ratio after resize', async () => {
    const input = await makeTestImage(2400, 1800); // 4:3
    const result = await processImage(input);
    const ratio = result.width / result.height;
    expect(ratio).toBeCloseTo(4 / 3, 2);
  });

  it('does not enlarge small images', async () => {
    const input = await makeTestImage(400, 300);
    const result = await processImage(input);
    expect(result.width).toBe(400);
    expect(result.height).toBe(300);
  });

  it('respects custom dimensions', async () => {
    const input = await makeTestImage(2400, 1800);
    const result = await processImage(input, { maxWidth: 800, maxHeight: 600 });
    expect(result.width).toBeLessThanOrEqual(800);
    expect(result.height).toBeLessThanOrEqual(600);
  });

  it('reports original dimensions correctly', async () => {
    const input = await makeTestImage(2000, 1500);
    const result = await processImage(input);
    expect(result.original.width).toBe(2000);
    expect(result.original.height).toBe(1500);
    expect(result.original.size).toBe(input.length);
  });

  it('produces smaller files at lower quality with realistic content', async () => {
    // Random noise — verklig bild med komplexitet, inte solid color (där WebP
    // komprimerar perfekt oavsett quality).
    const width = 400;
    const height = 300;
    const noise = Buffer.alloc(width * height * 3);
    for (let i = 0; i < noise.length; i++) noise[i] = Math.floor(Math.random() * 256);
    const input = await sharp(noise, {
      raw: { width, height, channels: 3 },
    })
      .png()
      .toBuffer();

    const high = await processImage(input, { quality: 95 });
    const low = await processImage(input, { quality: 30 });
    expect(low.size).toBeLessThan(high.size);
  });
});

describe('fetchImage', () => {
  it('returns a Buffer when fetch succeeds', async () => {
    const fakeBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG-magic
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      arrayBuffer: async () => fakeBytes.buffer,
    } as unknown as Response);

    const buffer = await fetchImage('https://example/test.png', fetchFn);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBe(4);
    expect(buffer[0]).toBe(0x89);
  });

  it('throws when HTTP fails', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as unknown as Response);

    await expect(fetchImage('https://example/missing.png', fetchFn)).rejects.toThrow(
      /404/,
    );
  });
});
