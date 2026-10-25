import { SogniClient } from '@sogni-ai/sogni-client';
import fs from 'fs/promises';
import path from 'path';

const API_KEY = process.env.SOGNI_API_KEY || '60898786-4a50-4dce-9474-0c333fd19256';
const OUT_DIR = path.resolve(process.cwd(), 'public/assets/sogni_pixel');

interface UiSpriteSpec {
  filename: string;
  prompt: string;
  width: number;
  height: number;
  allowText?: boolean;
}

const UI_SPRITE_ASSETS: UiSpriteSpec[] = [
  // 1. Official Game Wordmark Plaque Sprite
  {
    filename: 'ui_wordmark_logo.jpg',
    prompt:
      '16-bit 2D pixel art video game royal title banner plaque, ornate carved dark oak wooden ribbon board with golden brass trim, glowing golden acorns on left and right sides, and ajeweled golden crown at the top center, clean dark wood center area for title lettering, Kingdom Two Crowns and Stardew Valley pixel art UI style, no text, no letters',
    width: 768,
    height: 256,
  },
  // 2. 2D Sprite Button & Banner Plates
  {
    filename: 'ui_wood_button_gold.jpg',
    prompt:
      '16-bit 2D pixel art game UI button texture, carved warm amber oak wood plaque with ornate golden brass corner rivets and bevelled pixel border, clean empty center for button label, Stardew Valley RPG UI style, no text',
    width: 512,
    height: 256,
  },
  {
    filename: 'ui_parchment_banner.jpg',
    prompt:
      '16-bit 2D pixel art game UI panel background texture, aged warm royal parchment scroll framed inside dark carved oak wood beams with golden corner brackets, clean uniform center, Stardew Valley RPG UI style, no text',
    width: 512,
    height: 256,
  },
  // 3. 4 Bottom Menu Dock 2D Sprite Icons
  {
    filename: 'ui_tab_burrow.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of a cozy underground burrow archway carved under giant oak tree roots with a warm glowing lantern inside, dark brown pixel border frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'ui_tab_clan.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of a royal heraldic shield emblem featuring three cute brown rats and golden acorns on a dark wooden background, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'ui_tab_laws.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of a rolled royal parchment decree scroll tied with a golden ribbon and stamped with a red acorn wax seal, dark brown pixel border frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'ui_tab_quests.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of an ornate golden treasure chest overflowing with acorns, cheese, and a royal compass on a dark brown pixel frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  // 4. 8 Header & Camera Action 2D Sprite Icons
  {
    filename: 'ui_icon_help.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of an ancient leather-bound royal book of lore with a golden acorn clasp on a dark brown pixel frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'ui_icon_sun_day.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of a glowing golden hourglass sand timer with warm amber sand on a dark brown pixel frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'ui_icon_play_pause.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of a shining brass pocket watch and gear wheel on a dark emerald pixel frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'ui_icon_horn_event.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of a golden royal herald trumpet horn with a red royal banner on a dark brown pixel frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'ui_icon_zoom_in.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of a brass magnifying glass with a glowing green crystal lens on a dark brown pixel frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'ui_icon_zoom_out.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of a brass folding spyglass telescope on a dark brown pixel frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'ui_icon_recenter.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of a golden royal compass rose star emblem on a dark brown pixel frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
  {
    filename: 'ui_icon_close.jpg',
    prompt:
      '16-bit 2D pixel art game UI icon of a crimson red royal wax seal stamped with crossed golden swords on a dark brown pixel frame, crisp retro RPG icon, no text',
    width: 256,
    height: 256,
  },
];

async function generateOne(sogni: any, modelId: string, spec: UiSpriteSpec) {
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

  console.log(`Generating 2D UI sprite ${spec.filename}...`);
  try {
    const isFluxOrTurbo = modelId.includes('schnell') || modelId.includes('turbo');

    const project = await sogni.projects.create({
      type: 'image',
      modelId,
      positivePrompt: spec.prompt,
      negativePrompt: spec.allowText
        ? 'photorealistic, 3d render, photograph, blurry, watermark'
        : 'photorealistic, 3d render, photograph, blurry, smooth airbrush, watermark, text, letters',
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

  console.log('Connecting to Sogni Supernet to generate 15 2D Game UI & Branding Sprites...');
  const sogni = await SogniClient.createInstance({
    appId: 'the-rat-ruler-ui-sprites',
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

  const batchSize = 5;
  for (let i = 0; i < UI_SPRITE_ASSETS.length; i += batchSize) {
    const batch = UI_SPRITE_ASSETS.slice(i, i + batchSize);
    await Promise.all(batch.map((spec) => generateOne(sogni, chosenModel.id, spec)));
  }

  console.log('All 15 Sogni 2D Game UI & Branding Sprites generated!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
