import type { ArtSpec } from "./art";

export const CATEGORIES = [
  { name: "Landscape", slug: "landscape", description: "Coasts, fields and weather.", sortOrder: 1 },
  { name: "Still life", slug: "still-life", description: "Small arrangements of everyday objects.", sortOrder: 2 },
  { name: "Architecture", slug: "architecture", description: "Rooms, walls and the light inside them.", sortOrder: 3 },
  { name: "Film", slug: "film", description: "Moving image and short documentary.", sortOrder: 4 },
];

export const COLLECTIONS = [
  { title: "Coastal Studies", slug: "coastal-studies", description: "A year of returning to the same stretches of shoreline.", featured: true, sortOrder: 1 },
  { title: "Quiet Interiors", slug: "quiet-interiors", description: "Rooms, doors and tables — the small architecture of everyday light.", featured: true, sortOrder: 2 },
  { title: "Field Notes", slug: "field-notes", description: "Colour studies made on walks between projects.", featured: true, sortOrder: 3 },
];

const P = {
  dusk: ["#d9c3ad", "#b88f78", "#6f6a66", "#3d3a38", "#f2d9b8"],
  linen: ["#efe6d8", "#d8c6ae", "#b49a7c", "#8a6f57", "#f7efe4"],
  sage: ["#dfe0d2", "#a9ae97", "#7c846c", "#4f5745", "#f1ede0"],
  rosewood: ["#ead7cd", "#b77a68", "#7a3b2e", "#4b2a23", "#f4e3d6"],
  slate: ["#d4d4cf", "#9ea3a3", "#6b7273", "#3a3f41", "#ecebe5"],
  ochre: ["#efe0c4", "#d1a86a", "#a26f35", "#5d4126", "#f6ecd8"],
};

type ImageFixture = {
  title: string;
  slug: string;
  caption: string;
  description?: string;
  altText: string;
  category: string;
  collections: string[];
  tags: string[];
  featured?: boolean;
  allowDownload?: boolean;
  status?: "PUBLISHED" | "DRAFT";
  daysAgo: number;
  /** Unsplash-licensed photo served by picsum.photos (fetched at seed time). */
  photo: { id: number };
  /** Offline fallback: procedurally generated artwork. */
  art: ArtSpec;
};

const portrait = { width: 1600, height: 2000 };
const landscape = { width: 2400, height: 1600 };
const square = { width: 1800, height: 1800 };

export const IMAGES: ImageFixture[] = [
  {
    title: "Low Tide, November", slug: "low-tide-november", caption: "The sea pulled back to its furthest line.",
    description: "Made on the last calm morning before the winter storms. The horizon sits almost exactly where it did a year earlier.",
    altText: "A rocky headland covered in low shrubs above a calm, hazy sea.",
    category: "landscape", collections: ["coastal-studies"], tags: ["sea", "coast", "winter"], featured: true, allowDownload: true, daysAgo: 2,
    photo: { id: 37 }, art: { style: "horizon", ...landscape, palette: P.dusk, seed: 11 },
  },
  {
    title: "Last Field Light", slug: "last-field-light", caption: "A line of trees holding the end of the day.",
    altText: "A golden meadow with a row of silhouetted trees under an orange sunset sky.",
    category: "landscape", collections: ["field-notes"], tags: ["field", "dusk", "summer"], featured: true, allowDownload: true, daysAgo: 5,
    photo: { id: 110 }, art: { style: "field", ...portrait, palette: P.ochre, seed: 23 },
  },
  {
    title: "Window Seat, 3pm", slug: "window-seat-3pm", caption: "Long table, low sun, one cup left behind.",
    description: "A café near the harbour that only receives direct light in the depths of winter, when the sun is low enough to clear the roofs opposite.",
    altText: "A long wooden table beside tall windows in a café, a coffee cup catching warm afternoon light.",
    category: "architecture", collections: ["quiet-interiors"], tags: ["interior", "light", "winter"], featured: true, daysAgo: 8,
    photo: { id: 42 }, art: { style: "arch", ...portrait, palette: P.linen, seed: 37 },
  },
  {
    title: "Dune Line", slug: "dune-line", caption: "Wind-shaped sand under the first stars.",
    altText: "Smooth desert dunes in deep amber tones beneath a dark violet night sky.",
    category: "landscape", collections: ["field-notes"], tags: ["sand", "night", "texture"], featured: true, allowDownload: true, daysAgo: 12,
    photo: { id: 184 }, art: { style: "dunes", ...landscape, palette: P.sage, seed: 41 },
  },
  {
    title: "Pour-over", slug: "pour-over", caption: "Morning ritual, borrowed light.",
    altText: "A kettle pouring water into a glass pour-over coffee maker on a dark counter.",
    category: "still-life", collections: ["quiet-interiors"], tags: ["still life", "interior", "morning"], featured: true, daysAgo: 15,
    photo: { id: 1060 }, art: { style: "still", ...square, palette: P.rosewood, seed: 53 },
  },
  {
    title: "Morning Haze", slug: "morning-haze", caption: "Hills dissolving into cloud over still water.",
    altText: "A misty lake with a grassy shore, forested hills fading into pale fog.",
    category: "landscape", collections: ["field-notes"], tags: ["mist", "lake", "morning"], featured: true, allowDownload: true, daysAgo: 19,
    photo: { id: 11 }, art: { style: "mist", ...landscape, palette: P.slate, seed: 67 },
  },
  {
    title: "Harbour Light", slug: "harbour-light", caption: "Slate sea, slate sky, one white tower.",
    altText: "A black-and-white photograph of a small lighthouse on rocks under dramatic streaked clouds.",
    category: "architecture", collections: ["coastal-studies"], tags: ["sea", "stone", "monochrome"], featured: true, daysAgo: 23,
    photo: { id: 58 }, art: { style: "horizon", ...portrait, palette: P.slate, seed: 71 },
  },
  {
    title: "Green Coast", slug: "green-coast", caption: "Where the road gives up and the cliffs begin.",
    altText: "Steep green cliffs and a winding road under a soft grey sky.",
    category: "landscape", collections: ["coastal-studies"], tags: ["coast", "cliffs", "green"], featured: true, allowDownload: true, daysAgo: 25,
    photo: { id: 1018 }, art: { style: "dunes", ...landscape, palette: P.sage, seed: 79 },
  },
  {
    title: "Leaf Fall", slug: "leaf-fall", caption: "Colour remembered rather than seen.",
    altText: "Close-up of dry golden autumn leaves scattered on the ground with a soft blurred background.",
    category: "still-life", collections: ["field-notes"], tags: ["autumn", "colour", "texture"], allowDownload: true, daysAgo: 27,
    photo: { id: 167 }, art: { style: "field", ...portrait, palette: P.rosewood, seed: 83 },
  },
  {
    title: "Blue Door", slug: "blue-door", caption: "Weathered boards and a bicycle waiting.",
    altText: "A weathered wooden shed wall with a faded blue door and a green bicycle leaning against it.",
    category: "architecture", collections: ["quiet-interiors"], tags: ["texture", "wood", "colour"], daysAgo: 31,
    photo: { id: 76 }, art: { style: "arch", ...portrait, palette: P.sage, seed: 97 },
  },
  {
    title: "Cypress Road", slug: "cypress-road", caption: "A line of cypresses on a Tuscan rise.",
    altText: "A row of tall cypress trees on a hill above ploughed fields under a deep blue evening sky.",
    category: "landscape", collections: ["field-notes"], tags: ["field", "trees", "dusk"], daysAgo: 36,
    photo: { id: 116 }, art: { style: "still", ...landscape, palette: P.ochre, seed: 101 },
  },
  {
    title: "Reed Shore", slug: "reed-shore", caption: "Where the lake forgets which way the wind blows.",
    altText: "Tall green reeds in the foreground of a calm lake with layered mountains in soft evening light.",
    category: "landscape", collections: ["coastal-studies", "field-notes"], tags: ["lake", "reeds", "evening"], allowDownload: true, daysAgo: 41,
    photo: { id: 128 }, art: { style: "dunes", ...portrait, palette: P.linen, seed: 113 },
  },
  {
    title: "Canal Houses", slug: "canal-houses", caption: "Painted facades leaning over the water.",
    altText: "Colourful old townhouses lining a canal with small moored boats.",
    category: "architecture", collections: ["quiet-interiors"], tags: ["architecture", "water", "colour"], daysAgo: 46,
    photo: { id: 164 }, art: { style: "arch", ...landscape, palette: P.dusk, seed: 127 },
  },
  {
    title: "River Fog", slug: "river-fog", caption: "A lone figure, a fast river, the trees half-gone.",
    altText: "A rocky river running through a fog-covered forest valley with a small figure on the bank.",
    category: "landscape", collections: ["field-notes"], tags: ["mist", "river", "forest"], daysAgo: 52,
    photo: { id: 1044 }, art: { style: "mist", ...portrait, palette: P.dusk, seed: 131 },
  },
  {
    title: "Above the Fjord", slug: "above-the-fjord", caption: "Granite, water, distance.",
    altText: "A deep blue fjord winding between rocky mountains seen from a high cliff edge.",
    category: "landscape", collections: ["coastal-studies"], tags: ["water", "mountains"], daysAgo: 58,
    photo: { id: 1015 }, art: { style: "horizon", ...landscape, palette: P.slate, seed: 137 },
  },
  {
    title: "Storm Study (draft)", slug: "storm-study-draft", caption: "Work in progress.",
    altText: "Dark storm clouds over a slate-blue sea.",
    category: "landscape", collections: [], tags: ["sea", "weather"], status: "DRAFT", daysAgo: 1,
    photo: { id: 1019 }, art: { style: "field", ...square, palette: P.linen, seed: 149 },
  },
];

/** YouTube embeds of openly licensed Blender Foundation films (CC BY 3.0) used as sample external media. */
export const EXTERNAL = [
  {
    title: "Big Buck Bunny (sample embed)",
    slug: "big-buck-bunny-sample",
    url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    caption: "Sample YouTube embed — Blender Foundation, CC BY 3.0.",
    description: "Development fixture demonstrating a validated YouTube embed in privacy-enhanced mode. Replace with your own films.",
    category: "film",
    tags: ["film", "sample"],
    featured: false,
    daysAgo: 10,
  },
  {
    title: "Sintel (sample embed)",
    slug: "sintel-sample",
    url: "https://youtu.be/eRsGyueVLvQ",
    caption: "Sample YouTube embed — Blender Foundation, CC BY 3.0.",
    category: "film",
    tags: ["film", "sample"],
    featured: false,
    daysAgo: 33,
  },
  {
    title: "Process notes on Behance (sample link)",
    slug: "process-notes-sample-link",
    url: "https://www.behance.net/",
    caption: "How the coastal prints were made — sample external link card.",
    description: "Platforms without a verified embed integration are shown as a preview card with an outbound link.",
    category: null,
    tags: ["process", "sample"],
    featured: false,
    daysAgo: 21,
  },
];
