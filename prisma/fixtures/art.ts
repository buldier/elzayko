/**
 * Deterministic, procedurally composed artwork used as development fixtures.
 * Each composition is an SVG (soft shapes + film grain) rasterised to JPEG by sharp,
 * then fed through the same processing pipeline as real uploads.
 */
import sharp from "sharp";

export type ArtStyle = "horizon" | "field" | "dunes" | "arch" | "still" | "mist";

export type ArtSpec = {
  style: ArtStyle;
  width: number;
  height: number;
  palette: string[];
  seed: number;
};

function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const grain = (seed: number, opacity = 0.16) => `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed % 1000}" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="${opacity}"/></feComponentTransfer>
  </filter>`;

const soft = (id: string, deviation: number) =>
  `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${deviation}"/></filter>`;

function compose(spec: ArtSpec): string {
  const { width: w, height: h, palette: p, seed } = spec;
  const r = rng(seed);
  const [c0, c1, c2, c3, c4] = p as [string, string, string, string, string];
  let body = "";

  switch (spec.style) {
    case "horizon": {
      const horizon = h * (0.48 + r() * 0.16);
      const sunX = w * (0.3 + r() * 0.4);
      body = `
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient>
        <rect width="${w}" height="${horizon}" fill="url(#sky)"/>
        <circle cx="${sunX}" cy="${horizon - h * 0.08}" r="${w * 0.07}" fill="${c4}" opacity="0.85" filter="url(#blur)"/>
        <rect y="${horizon}" width="${w}" height="${h - horizon}" fill="url(#sea)"/>
        ${Array.from({ length: 14 }, (_, i) => {
          const y = horizon + (h - horizon) * (i / 14) + r() * 8;
          return `<rect x="${r() * w * 0.3}" y="${y}" width="${w * (0.4 + r() * 0.6)}" height="${1 + r() * 2.5}" fill="${c4}" opacity="${0.05 + r() * 0.12}"/>`;
        }).join("")}
        <rect y="${horizon - 1}" width="${w}" height="2" fill="${c1}" opacity="0.6"/>`;
      break;
    }
    case "field": {
      const top = h * (0.08 + r() * 0.04);
      const split = h * (0.42 + r() * 0.12);
      body = `
        <rect width="${w}" height="${h}" fill="${c0}"/>
        <rect x="${w * 0.1}" y="${top}" width="${w * 0.8}" height="${split - top - h * 0.03}" fill="${c1}" filter="url(#edge)" opacity="0.92"/>
        <rect x="${w * 0.1}" y="${split}" width="${w * 0.8}" height="${h * 0.9 - split}" fill="${c2}" filter="url(#edge)" opacity="0.9"/>
        <rect x="${w * 0.14}" y="${split + h * 0.06}" width="${w * 0.72}" height="${h * 0.05}" fill="${c3}" filter="url(#edge)" opacity="0.5"/>`;
      break;
    }
    case "dunes": {
      body = `<rect width="${w}" height="${h}" fill="${c0}"/>`;
      const layers = 5;
      for (let i = 0; i < layers; i++) {
        const base = h * (0.35 + i * 0.13);
        const amp = h * (0.03 + r() * 0.05);
        const phase = r() * Math.PI * 2;
        let d = `M0 ${h} L0 ${base}`;
        for (let x = 0; x <= w; x += w / 40) {
          d += ` L${x.toFixed(1)} ${(base + Math.sin(x / (w / (1.5 + r() * 0.2)) * Math.PI + phase) * amp).toFixed(1)}`;
        }
        d += ` L${w} ${h} Z`;
        body += `<path d="${d}" fill="${p[(i % 4) + 1]}" opacity="${0.75 + i * 0.05}"/>`;
      }
      break;
    }
    case "arch": {
      const aw = w * 0.42;
      const ax = (w - aw) / 2;
      const ay = h * 0.18;
      const ah = h * 0.62;
      body = `
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient>
        <linearGradient id="light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c4}"/><stop offset="1" stop-color="${c3}"/></linearGradient>
        <rect width="${w}" height="${h}" fill="url(#wall)"/>
        <path d="M${ax} ${ay + aw / 2} A${aw / 2} ${aw / 2} 0 0 1 ${ax + aw} ${ay + aw / 2} L${ax + aw} ${ay + ah} L${ax} ${ay + ah} Z" fill="url(#light)"/>
        <path d="M${ax + aw * 0.1} ${ay + ah} L${ax + aw * 1.6} ${h} L${ax - aw * 0.2} ${h} Z" fill="${c4}" opacity="0.22" filter="url(#blur)"/>
        <rect y="${ay + ah}" width="${w}" height="${h - ay - ah}" fill="${c2}" opacity="0.55"/>`;
      break;
    }
    case "still": {
      const table = h * 0.66;
      body = `
        <rect width="${w}" height="${table}" fill="${c0}"/>
        <rect y="${table}" width="${w}" height="${h - table}" fill="${c1}"/>`;
      const count = 3 + Math.floor(r() * 2);
      for (let i = 0; i < count; i++) {
        const cx = w * (0.22 + (i / count) * 0.6 + r() * 0.05);
        const rad = w * (0.06 + r() * 0.06);
        const cy = table - rad * (0.5 + r() * 0.6);
        body += `<ellipse cx="${cx + rad * 0.6}" cy="${table + rad * 0.12}" rx="${rad * 1.3}" ry="${rad * 0.18}" fill="${c3}" opacity="0.35" filter="url(#blur)"/>`;
        body +=
          r() > 0.5
            ? `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${p[2 + (i % 3)]}"/>`
            : `<rect x="${cx - rad * 0.7}" y="${table - rad * 2.4}" width="${rad * 1.4}" height="${rad * 2.4}" rx="${rad * 0.25}" fill="${p[2 + (i % 3)]}"/>`;
      }
      break;
    }
    case "mist": {
      body = `
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient>
        <rect width="${w}" height="${h}" fill="url(#haze)"/>`;
      for (let i = 0; i < 4; i++) {
        const y = h * (0.45 + i * 0.12);
        let d = `M0 ${h} L0 ${y}`;
        for (let x = 0; x <= w; x += w / 24) d += ` L${x.toFixed(1)} ${(y - r() * h * 0.08 * (1 - i * 0.15)).toFixed(1)}`;
        d += ` L${w} ${h} Z`;
        body += `<path d="${d}" fill="${p[2 + (i % 3)]}" opacity="${0.35 + i * 0.18}" filter="url(#blurSmall)"/>`;
      }
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>${grain(seed)}${soft("blur", w * 0.02)}${soft("blurSmall", w * 0.004)}${soft("edge", w * 0.006)}</defs>
    ${body}
    <rect width="${w}" height="${h}" filter="url(#grain)"/>
  </svg>`;
}

export async function renderArt(spec: ArtSpec): Promise<Buffer> {
  return sharp(Buffer.from(compose(spec))).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}
