import { SogniClient } from '@sogni-ai/sogni-client';
import fs from 'fs/promises';
import path from 'path';

const API_KEY = process.env.SOGNI_API_KEY || '60898786-4a50-4dce-9474-0c333fd19256';
const OUT_DIR = path.resolve(process.cwd(), 'public/assets/sogni_2d');

interface SpriteAssetSpec {
  filename: string;
  prompt: string;
  width: number;
  height: number;
}

const SPRITESHEET_ASSETS: SpriteAssetSpec[] = [
  {
    filename: 'rat_walk_sheet.jpg',
    prompt:
      '2D game animation sprite sheet of a realistic wild brown agouti rat (Rattus norvegicus) walking in strict side profile view facing right, 4 sequential horizontal quadruped walk cycle frames arranged in a 2x2 grid on a solid pure white background (#FFFFFF), full body from pink nose tip and whiskers to long pink scaly tail, realistic agouti brown fur texture, clean sharp cutout edges, no shadows on background, 2D mobile game sprite sheet asset, no text',
    width: 1024,
    height: 512,
  },
  {
    filename: 'rat_forager_sheet.jpg',
    prompt:
      '2D game animation sprite sheet of a sleek wild brown rat (Rattus norvegicus) in strict side profile view facing right, holding an acorn and foraging, 4 sequential animation frames arranged in a 2x2 grid on a solid pure white background (#FFFFFF), full body with whiskers and long tail, realistic natural rodent anatomy, clean cutout edges, no shadows on background, 2D mobile game sprite sheet, no text',
    width: 1024,
    height: 512,
  },
  {
    filename: 'rat_rear_sheet.jpg',
    prompt:
      '2D game animation sprite sheet of an alert wild hooded and agouti brown rat (Rattus norvegicus) in strict side profile view facing right, rearing up on hind legs and sniffing air with whiskers, 4 sequential frames arranged in a 2x2 grid on a solid pure white background (#FFFFFF), full body with tail, clean cutout edges, no shadows on background, 2D mobile game sprite sheet, no text',
    width: 1024,
    height: 512,
  },
  {
    filename: 'rat_dig_sheet.jpg',
    prompt:
      '2D game animation sprite sheet of a muscular wild brown rat (Rattus norvegicus) in strict side profile view facing right, digging and clawing earth with front paws, 4 sequential animation frames in a 2x2 grid on a solid pure white background (#FFFFFF), full body with long tail, realistic fur, clean cutout edges, no shadows on background, 2D mobile game sprite sheet, no text',
    width: 1024,
    height: 512,
  },
  {
    filename: 'cutaway_soil_cross_section.jpg',
    prompt:
      '2D mobile game side-view underground cross-section background like Fallout Shelter and Oxygen Not Included, rich dark subterranean soil strata with gnarled oak tree roots at the top forest surface, layered clay, pebbles, and deep bedrock below, atmospheric 2D game environment art, no text, no UI',
    width: 1024,
    height: 768,
  },
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log('Connecting to Sogni Supernet to generate 2D rat spritesheets...');
  const sogni = await SogniClient.createInstance({
    appId: 'the-rat-ruler-2d-spritesheets',
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

  for (const spec of SPRITESHEET_ASSETS) {
    const outPath = path.join(OUT_DIR, spec.filename);
    try {
      const stat = await fs.stat(outPath);
      if (stat.size > 5000) {
        console.log(`Skipping ${spec.filename} (already exists)`);
        continue;
      }
    } catch {
      // generate
    }

    console.log(`Generating 2D spritesheet ${spec.filename}...`);
    try {
      const isFluxOrTurbo =
        chosenModel.id.includes('schnell') || chosenModel.id.includes('turbo');

      const project = await sogni.projects.create({
        type: 'image',
        modelId: chosenModel.id,
        positivePrompt: spec.prompt,
        negativePrompt:
          '3d render, anthropomorphic, clothes, armor, crown, cartoon, human hands, text, watermark, grid lines, borders, dark background, complex background',
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

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
