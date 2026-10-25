import { SogniClient } from '@sogni-ai/sogni-client';
import fs from 'fs/promises';
import path from 'path';

const API_KEY = process.env.SOGNI_API_KEY || '60898786-4a50-4dce-9474-0c333fd19256';
const OUT_DIR = path.resolve(process.cwd(), 'public/assets/sogni_real');

interface AssetSpec {
  filename: string;
  prompt: string;
  width: number;
  height: number;
}

const REAL_RAT_ASSETS: AssetSpec[] = [
  {
    filename: 'title_backdrop.jpg',
    prompt:
      'National Geographic and BBC Earth award-winning macro wildlife photography of a real wild brown rat (Rattus norvegicus) standing alert on a mossy root ledge inside a vast realistic underground earthen burrow system, natural shafts of dim golden sunlight filtering through soil and tree roots on the right side, dark calm subterranean earth shadow on the left 40 percent, photorealistic agouti fur texture, wet nose, long whiskers, ultra detailed 8k wildlife camera photo, no clothes, no crown, no text',
    width: 1024,
    height: 576,
  },
  {
    filename: 'crest_emblem.jpg',
    prompt:
      'Macro wildlife close-up photograph of a real wild brown rat (Rattus norvegicus) face and expressive dark eyes emerging from a circular tree-root burrow opening in rich dark soil, photorealistic fur and whiskers, natural dramatic rim lighting, BBC Earth photography, no clothes, no text',
    width: 512,
    height: 512,
  },
  {
    filename: 'caste_ruler.jpg',
    prompt:
      'Photorealistic BBC Earth macro wildlife photograph of a large, powerful dominant alpha wild brown rat (Rattus norvegicus) on all fours in a deep underground soil chamber, thick glossy agouti brown fur, alert intelligent dark eyes, long whiskers, natural rodent anatomy, realistic earthen tunnel background, 8k wildlife photography, no clothes, no crown, no text',
    width: 512,
    height: 512,
  },
  {
    filename: 'caste_forager.jpg',
    prompt:
      'Photorealistic BBC Earth macro wildlife photograph of a sleek, agile wild brown rat (Rattus norvegicus) foraging in an underground burrow, holding a real acorn and wild seed pod in its front paws, realistic agouti fur, long whiskers, natural damp soil and roots background, 8k wildlife photography, no clothes, no text',
    width: 512,
    height: 512,
  },
  {
    filename: 'caste_engineer.jpg',
    prompt:
      'Photorealistic BBC Earth macro wildlife photograph of a muscular wild brown rat (Rattus norvegicus) actively digging and excavating damp dark earth and pebbles with its front claws inside an underground tunnel beneath tree roots, dirt particles on whiskers, natural rodent anatomy, 8k wildlife photography, no clothes, no goggles, no text',
    width: 512,
    height: 512,
  },
  {
    filename: 'caste_savant.jpg',
    prompt:
      'Photorealistic BBC Earth macro wildlife photograph of an alert wild hooded and agouti rat (Rattus norvegicus) rearing up on its hind legs in an underground tunnel junction, sniffing the air with spread whiskers, expressive intelligent eyes, realistic fur and paws, 8k wildlife photography, no clothes, no text',
    width: 512,
    height: 512,
  },
  {
    filename: 'caste_matriarch.jpg',
    prompt:
      'Photorealistic BBC Earth macro wildlife photograph of a real mother brown rat (Rattus norvegicus) curled inside a warm underground nest of dry grass and shredded bark, gently grooming her tiny real rat pups, tender natural wildlife behavior, soft subterranean lighting, 8k wildlife photography, no clothes, no text',
    width: 512,
    height: 512,
  },
  {
    filename: 'caste_vanguard.jpg',
    prompt:
      'Photorealistic BBC Earth macro wildlife photograph of a heavy, battle-scarred guard wild brown rat (Rattus norvegicus) standing in a defensive posture at the narrow entrance of an underground root tunnel, bristled agouti fur, bared orange incisors, intense dark eyes, 8k wildlife photography, no armor, no clothes, no text',
    width: 512,
    height: 512,
  },
  {
    filename: 'chamber_throne.jpg',
    prompt:
      'Photorealistic BBC Earth cross-section wildlife photograph of a real underground rat colony central nesting chamber hollowed out beneath massive gnarled oak tree roots, multiple real wild brown rats huddling and grooming on a bed of dry moss and leaves, realistic damp soil walls, 8k nature documentary photo, no text',
    width: 768,
    height: 512,
  },
  {
    filename: 'chamber_granary.jpg',
    prompt:
      'Photorealistic BBC Earth cross-section wildlife photograph of an underground rodent food cache chamber filled with real stored acorns, wheat kernels, wild berries, tubers, and subterranean mushrooms tucked between tree roots, a real brown rat inspecting the food hoard, 8k nature photography, no text',
    width: 768,
    height: 512,
  },
  {
    filename: 'chamber_nursery.jpg',
    prompt:
      'Photorealistic BBC Earth cross-section wildlife photograph of an insulated underground rat maternal brood nest woven from dry grass, feathers, and soft moss deep beneath tree roots, real female brown rats tending a litter of small pups, warm natural subterranean ambiance, 8k wildlife photo, no text',
    width: 768,
    height: 512,
  },
  {
    filename: 'chamber_sensorium.jpg',
    prompt:
      'Photorealistic BBC Earth cross-section wildlife photograph of a complex underground rat tunnel intersection and acoustic junction with smooth worn clay floors, tree root arches, and two real wild brown rats touching noses and whisking to communicate, 8k wildlife photography, no text',
    width: 768,
    height: 512,
  },
  {
    filename: 'chamber_hydro.jpg',
    prompt:
      'Photorealistic BBC Earth cross-section wildlife photograph of an underground water seepage basin inside a rodent burrow, clear groundwater dripping from wet limestone and tree roots into a natural clay pool where a real wild brown rat is drinking, 8k wildlife photography, no text',
    width: 768,
    height: 512,
  },
  {
    filename: 'chamber_excavation.jpg',
    prompt:
      'Photorealistic BBC Earth cross-section wildlife photograph of a freshly dug underground rat tunnel expansion face, clawed dark soil, exposed quartz pebbles, root fibers, and real wild brown rats kicking loose earth backward, 8k wildlife photography, no text',
    width: 768,
    height: 512,
  },
  {
    filename: 'chamber_bastion.jpg',
    prompt:
      'Photorealistic BBC Earth cross-section wildlife photograph of a narrow fortified underground burrow bolt-hole entrance choked with tightly wedged stones, thorny twigs, and tree roots, with a real wild guard rat watching the shaft, 8k wildlife photography, no text',
    width: 768,
    height: 512,
  },
  {
    filename: 'burrow_map_bg.jpg',
    prompt:
      'Photorealistic macro geological cross-section photograph of natural dark subterranean topsoil, clay, pebbles, and intertwined oak tree roots underground, realistic damp earth texture for a nature documentary burrow diagram, no text',
    width: 1024,
    height: 768,
  },
  {
    filename: 'rat_fur_agouti.jpg',
    prompt:
      'Flat orthographic 1:1 seamless texture tile of real wild brown rat (Rattus norvegicus) agouti pelage fur, dense coarse brown and warm russet-grey guard hairs with dark tips, macro wildlife fur photography, even studio lighting, no borders, no perspective, seamless tileable fur material',
    width: 512,
    height: 512,
  },
  {
    filename: 'subterranean_soil_tile.jpg',
    prompt:
      'Flat orthographic 1:1 seamless texture tile of damp dark subterranean loam soil, clay, fine root fibers, and small mineral pebbles, macro geological surface texture, even lighting, no borders, no perspective',
    width: 512,
    height: 512,
  },
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log('Connecting to Sogni Supernet for photorealistic real rat assets...');
  const sogni = await SogniClient.createInstance({
    appId: 'the-rat-ruler-real-wildlife-v2',
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
  console.log('Selected Sogni model:', chosenModel.id, 'workers:', chosenModel.workerCount);

  for (const spec of REAL_RAT_ASSETS) {
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

    console.log(`Generating photorealistic ${spec.filename}...`);
    try {
      const isFluxOrTurbo =
        chosenModel.id.includes('schnell') || chosenModel.id.includes('turbo');

      const project = await sogni.projects.create({
        type: 'image',
        modelId: chosenModel.id,
        positivePrompt: spec.prompt,
        negativePrompt:
          'anthropomorphic, clothes, armor, crown, hat, goggles, cartoon, illustration, anime, fantasy, human hands, standing like human, text, watermark, blurry',
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
