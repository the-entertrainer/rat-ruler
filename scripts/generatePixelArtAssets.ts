import { SogniClient } from '@sogni-ai/sogni-client';
import fs from 'fs/promises';
import path from 'path';

const API_KEY = process.env.SOGNI_API_KEY || '60898786-4a50-4dce-9474-0c333fd19256';
const OUT_DIR = path.resolve(process.cwd(), 'public/assets/sogni_pixel');

interface PixelAssetSpec {
  filename: string;
  prompt: string;
  width: number;
  height: number;
}

const PIXEL_ASSETS: PixelAssetSpec[] = [
  // 1. Cutaway Underground Background & Title Screen
  {
    filename: 'pixel_underground_bg.jpg',
    prompt:
      '16-bit 2D pixel art side-view underground cutaway background like Terraria and Kingdom Two Crowns, pixelated giant oak tree and green grass at top surface, layered pixel art brown dirt, roots, clay, and dark stone strata below, crisp pixel art blocks, retro pixel game environment, no text, no UI',
    width: 1024,
    height: 768,
  },
  {
    filename: 'pixel_title_bg.jpg',
    prompt:
      '16-bit 2D pixel art masterpiece scene of a cozy underground rat kingdom carved beneath giant oak tree roots, glowing pixel art mushrooms, warm pixel lanterns, retro SNES / Stardew Valley / Kingdom Two Crowns pixel art style, rich warm colors, no text',
    width: 1024,
    height: 576,
  },

  // 2. 7 Pixel Art Cutaway Room Interiors
  {
    filename: 'pixel_room_throne.jpg',
    prompt:
      '16-bit 2D pixel art side-view underground room interior of a cozy royal rat throne room carved inside oak tree roots, pixel art wooden acorn throne, warm pixel torches, red carpet on a flat pixel wooden floor at the bottom, Stardew Valley and Terraria pixel art style, no text',
    width: 512,
    height: 256,
  },
  {
    filename: 'pixel_room_granary.jpg',
    prompt:
      '16-bit 2D pixel art side-view underground room interior of a cozy rat pantry and granary filled with pixel art cheese wheels, acorns, red berries, and grain sacks on wooden shelves, flat pixel wooden floor at the bottom, Stardew Valley and Terraria pixel art style, no text',
    width: 512,
    height: 256,
  },
  {
    filename: 'pixel_room_nursery.jpg',
    prompt:
      '16-bit 2D pixel art side-view underground room interior of a warm cozy rat nursery den with soft woven straw nests, glowing blue pixel mushrooms, and warm lantern light, flat pixel floor at the bottom, Stardew Valley and Terraria pixel art style, no text',
    width: 512,
    height: 256,
  },
  {
    filename: 'pixel_room_scout.jpg',
    prompt:
      '16-bit 2D pixel art side-view underground room interior of a rat elder study and scout hall with pixel art parchment maps, glowing crystal lanterns, and wooden bookshelves carved into earth walls, flat pixel floor at the bottom, Terraria pixel art style, no text',
    width: 512,
    height: 256,
  },
  {
    filename: 'pixel_room_well.jpg',
    prompt:
      '16-bit 2D pixel art side-view underground room interior of a subterranean fresh water spring well with pixel art stone basin, clear blue water pool, dripping oak roots, and glowing green moss, flat pixel stone floor at the bottom, Terraria pixel art style, no text',
    width: 512,
    height: 256,
  },
  {
    filename: 'pixel_room_mine.jpg',
    prompt:
      '16-bit 2D pixel art side-view underground room interior of a deep underground mine room with pixel art wooden support beams, glowing mushrooms, rock pickaxes, and dirt mounds, flat pixel stone floor at the bottom, Terraria pixel art style, no text',
    width: 512,
    height: 256,
  },
  {
    filename: 'pixel_room_watchtower.jpg',
    prompt:
      '16-bit 2D pixel art side-view underground room interior of a rat guard watchpost room with pixel art wooden palisade gate, brass warning bell, torches, and stone walls, flat pixel floor at the bottom, Terraria pixel art style, no text',
    width: 512,
    height: 256,
  },

  // 3. 4 Pixel Art 2D Rat Spritesheets on Pure White Background
  {
    filename: 'pixel_rat_walk_sheet.jpg',
    prompt:
      '16-bit 2D pixel art game sprite sheet of a cute brown rat in strict side profile view facing right walking on four legs, 4 distinct sequential walk cycle frames arranged in a 2x2 grid on a solid pure white background (#FFFFFF), crisp pixel art edges, dark pixel outline, retro 16-bit pixel art sprite sheet, no background clutter, no text',
    width: 1024,
    height: 512,
  },
  {
    filename: 'pixel_rat_forage_sheet.jpg',
    prompt:
      '16-bit 2D pixel art game sprite sheet of a cute brown rat in strict side profile view facing right holding an acorn and nibbling, 4 distinct sequential frames arranged in a 2x2 grid on a solid pure white background (#FFFFFF), crisp pixel art edges, dark pixel outline, retro 16-bit pixel art sprite sheet, no text',
    width: 1024,
    height: 512,
  },
  {
    filename: 'pixel_rat_rear_sheet.jpg',
    prompt:
      '16-bit 2D pixel art game sprite sheet of a cute brown rat in strict side profile view facing right standing up on hind legs and sniffing, 4 distinct sequential frames arranged in a 2x2 grid on a solid pure white background (#FFFFFF), crisp pixel art edges, dark pixel outline, retro 16-bit pixel art sprite sheet, no text',
    width: 1024,
    height: 512,
  },
  {
    filename: 'pixel_rat_dig_sheet.jpg',
    prompt:
      '16-bit 2D pixel art game sprite sheet of a cute brown rat in strict side profile view facing right digging dirt with front paws, 4 distinct sequential frames arranged in a 2x2 grid on a solid pure white background (#FFFFFF), crisp pixel art edges, dark pixel outline, retro 16-bit pixel art sprite sheet, no text',
    width: 1024,
    height: 512,
  },

  // 4. 6 Pixel Art Rat Role Portraits & 4 Pixel Art HUD Icons
  {
    filename: 'pixel_portrait_king.jpg',
    prompt:
      '16-bit 2D pixel art RPG character portrait icon of a noble brown rat king wearing a tiny golden acorn crown, warm burrow background, crisp pixel art, Stardew Valley portrait style, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'pixel_portrait_gatherer.jpg',
    prompt:
      '16-bit 2D pixel art RPG character portrait icon of a cheerful brown gatherer rat holding a red berry and acorn, warm burrow background, crisp pixel art, Stardew Valley portrait style, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'pixel_portrait_miner.jpg',
    prompt:
      '16-bit 2D pixel art RPG character portrait icon of a sturdy brown miner rat beside glowing cave crystals and earth, warm burrow background, crisp pixel art, Stardew Valley portrait style, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'pixel_portrait_elder.jpg',
    prompt:
      '16-bit 2D pixel art RPG character portrait icon of a wise old gray-whiskered elder rat beside a glowing lantern, warm burrow background, crisp pixel art, Stardew Valley portrait style, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'pixel_portrait_caretaker.jpg',
    prompt:
      '16-bit 2D pixel art RPG character portrait icon of a gentle mother rat in a cozy straw nest with glowing mushrooms, warm burrow background, crisp pixel art, Stardew Valley portrait style, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'pixel_portrait_guard.jpg',
    prompt:
      '16-bit 2D pixel art RPG character portrait icon of a brave sentinel guard rat by a wooden burrow gate, warm burrow background, crisp pixel art, Stardew Valley portrait style, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'pixel_icon_food.jpg',
    prompt:
      '16-bit 2D pixel art game icon of golden cheese wheel, acorns, and red berries on a dark brown pixel frame, crisp retro pixel art icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'pixel_icon_shroom.jpg',
    prompt:
      '16-bit 2D pixel art game icon of glowing emerald and cyan underground mushrooms on a dark brown pixel frame, crisp retro pixel art icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'pixel_icon_mood.jpg',
    prompt:
      '16-bit 2D pixel art game icon of a glowing golden heart and happy rat emblem on a dark brown pixel frame, crisp retro pixel art icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'pixel_icon_crown.jpg',
    prompt:
      '16-bit 2D pixel art game icon of a shining golden royal rat crown studded with rubies on a dark brown pixel frame, crisp retro pixel art icon, no text',
    width: 256,
    height: 256,
  },
];

async function generateOne(sogni: any, modelId: string, spec: PixelAssetSpec) {
  const outPath = path.join(OUT_DIR, spec.filename);
  try {
    const stat = await fs.stat(outPath);
    if (stat.size > 2000) {
      console.log(`Skipping ${spec.filename} (already exists)`);
      return;
    }
  } catch {
    // proceed
  }

  console.log(`Generating pixel art ${spec.filename}...`);
  try {
    const isFluxOrTurbo =
      modelId.includes('schnell') || modelId.includes('turbo');

    const project = await sogni.projects.create({
      type: 'image',
      modelId,
      positivePrompt: spec.prompt,
      negativePrompt:
        'photorealistic, 3d render, photograph, blurry, smooth airbrush, watermark, text, letters, UI frame',
      steps: isFluxOrTurbo ? 4 : 16,
      guidance: isFluxOrTurbo ? 1 : 6.5,
      width: spec.width,
      height: spec.height,
      numberOfMedia: 1,
      outputFormat: 'jpg',
      tokenType: 'spark',
      network: 'fast',
    });

    const urls = await project.waitForCompletion();
    if (urls && urls[0]) {
      const res = await fetch(urls[0]);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        await fs.writeFile(outPath, buf);
        console.log(`Saved ${spec.filename} (${buf.length} bytes)`);
      }
    }
  } catch (err: any) {
    console.error(`Error generating ${spec.filename}:`, err?.message || err);
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log('Connecting to Sogni Supernet to generate 2D Pixel Art assets...');
  const sogni = await SogniClient.createInstance({
    appId: 'the-rat-ruler-pixel-art',
    appSource: 'the-rat-ruler',
    network: 'fast',
    apiKey: API_KEY,
  });

  const models = await sogni.projects.waitForModels();
  const preferredIds = ['flux1-schnell-fp8', 'z_image_turbo_bf16', 'krea-2-turbo'];
  let chosenModel = models.find((m) => preferredIds.includes(m.id) && m.workerCount > 0);
  if (!chosenModel) {
    chosenModel = models.reduce((a, b) => (a.workerCount > b.workerCount ? a : b), models[0]);
  }
  console.log('Selected Sogni model:', chosenModel.id);

  // Process in batches of 4 for fast generation
  const batchSize = 4;
  for (let i = 0; i < PIXEL_ASSETS.length; i += batchSize) {
    const batch = PIXEL_ASSETS.slice(i, i + batchSize);
    await Promise.all(batch.map((spec) => generateOne(sogni, chosenModel.id, spec)));
  }

  console.log('All Sogni 2D Pixel Art assets generated!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
