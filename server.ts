import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Supercomputer Ethology & Sociobiology Analysis Endpoint
  app.post('/api/supercomputer/analyze', async (req, res) => {
    const { colonyState } = req.body || {};
    const ai = getGenAIClient();

    const fallbackResponse = buildDeterministicSupercomputerAnalysis(colonyState);

    if (!ai) {
      return res.json(fallbackResponse);
    }

    try {
      const prompt = `You are a biological supercomputer running a real-time ethological, evolutionary, and sociobiological simulation of an evolving subterranean Rattus norvegicus civilization ("The Rat Ruler").
Current Colony State:
- Generation: ${colonyState?.generation ?? 1}
- Population: ${colonyState?.population ?? 28} / Capacity ${colonyState?.maxCapacity ?? 45}
- Encephalization Quotient (EQ): ${colonyState?.encephalization ?? 0.62}
- Hamilton Eusociality Index (rB > C): ${colonyState?.eusocialityIndex ?? 34}%
- Calhoun Density Stress (NR3C1 Methylation): ${colonyState?.stressIndex ?? 18}%
- Metabolic ATP Reserve: ${colonyState?.atpKcal ?? 1200} kcal
- Symbiotic Mycelium Biomass: ${colonyState?.myceliumStock ?? 180} g
- Dominant Acoustic Frequency: ${colonyState?.dominantFrequencyKhz ?? 50} kHz
- Active Epoch: ${colonyState?.epochName ?? 'Cooperative Burrow Network'}

Generate a rigorous, scientifically grounded ethological supercomputer report and a high-stakes evolutionary dilemma for the Rat Ruler to adjudicate.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ethologyReport: {
                type: Type.STRING,
                description: '2-3 sentence scientific observation citing rodent neurobiology, epigenetics, or eusocial evolution.',
              },
              emergentPhenomenon: {
                type: Type.STRING,
                description: 'Title of the emergent societal behavior detected by the simulation.',
              },
              causalMechanism: {
                type: Type.STRING,
                description: 'Biological/physical mechanism (e.g. NR3C1 promoter demethylation via allogrooming, FOX2P ultrasonic syntax).',
              },
              dilemmaTitle: {
                type: Type.STRING,
                description: 'Title of the Royal Decree dilemma requiring ruler intervention.',
              },
              dilemmaContext: {
                type: Type.STRING,
                description: 'Scientific and societal stakes of the dilemma.',
              },
              optionA: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  scientificRationale: { type: Type.STRING },
                  atpDelta: { type: Type.NUMBER },
                  stressDelta: { type: Type.NUMBER },
                  eusocialityDelta: { type: Type.NUMBER },
                  eqDelta: { type: Type.NUMBER },
                },
                required: ['label', 'scientificRationale', 'atpDelta', 'stressDelta', 'eusocialityDelta', 'eqDelta'],
              },
              optionB: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  scientificRationale: { type: Type.STRING },
                  atpDelta: { type: Type.NUMBER },
                  stressDelta: { type: Type.NUMBER },
                  eusocialityDelta: { type: Type.NUMBER },
                  eqDelta: { type: Type.NUMBER },
                },
                required: ['label', 'scientificRationale', 'atpDelta', 'stressDelta', 'eusocialityDelta', 'eqDelta'],
              },
            },
            required: [
              'ethologyReport',
              'emergentPhenomenon',
              'causalMechanism',
              'dilemmaTitle',
              'dilemmaContext',
              'optionA',
              'optionB',
            ],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text.trim());
        return res.json({ ...parsed, source: 'gemini-supercomputer' });
      }
      return res.json(fallbackResponse);
    } catch (_err) {
      // Graceful fallback when quota or network is unavailable
      return res.json(fallbackResponse);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Rat Ruler server running at http://localhost:${PORT}`);
  });
}

function buildDeterministicSupercomputerAnalysis(colonyState: Record<string, any> = {}) {
  const stress = Number(colonyState?.stressIndex ?? 22);
  const eq = Number(colonyState?.encephalization ?? 0.65);
  const eusociality = Number(colonyState?.eusocialityIndex ?? 38);

  if (stress > 55) {
    return {
      source: 'deterministic-biocompute',
      ethologyReport:
        'Elevated spatial density has triggered HPA-axis hyper-reactivity across peripheral chambers. Glucocorticoid receptor (NR3C1) promoter methylation is rising in juvenile cohorts, mirroring Calhoun Phase-C behavioral withdrawal.',
      emergentPhenomenon: 'Epigenetic Glucocorticoid Cascade',
      causalMechanism: 'Hippocampal NR3C1 CpG Island Methylation under Crowding',
      dilemmaTitle: 'Mandate Alloparental Grooming & Acoustic Damping',
      dilemmaContext:
        'Brood Matriarchs propose reallocating 25% of foraging shifts to intensive tactile allogrooming and 50-kHz ultrasonic resonance to demethylate stress alleles before agonistic factions splinter the warren.',
      optionA: {
        label: 'Enforce Allogrooming Sanctuaries',
        scientificRationale: 'Histone acetyltransferase activation restores glucocorticoid feedback, sharply reducing stress at an ATP foraging cost.',
        atpDelta: -180,
        stressDelta: -22,
        eusocialityDelta: 8,
        eqDelta: 0.06,
      },
      optionB: {
        label: 'Channel Corticosterone into Deep Excavation',
        scientificRationale: 'Exploits adrenergic arousal to carve deep peripheral galleries, trading short-term metabolic strain for structural expansion.',
        atpDelta: 140,
        stressDelta: 6,
        eusocialityDelta: 4,
        eqDelta: 0.03,
      },
    };
  }

  if (eq >= 1.1) {
    return {
      source: 'deterministic-biocompute',
      ethologyReport:
        'Cerebral Savants have developed combinatorial 50-kHz ultrasonic syntax capable of encoding spatial vector coordinates and fungal crop nitrogen ratios across three tunnel junctions.',
      emergentPhenomenon: 'Recursive Ultrasonic Syntax & Mycelial Symbiosis',
      causalMechanism: 'FOXP2 Cortico-Striatal Plasticity & Termitomyces Co-Cultivation',
      dilemmaTitle: 'Codify the Bone-Tablet Acoustic Lexicon',
      dilemmaContext:
        'Savants request metabolic subsidies to institutionalize larval ultrasonic imprinting. Doing so accelerates encephalization toward the Noosphere Singularity but increases basal cranial glucose consumption by 24%.',
      optionA: {
        label: 'Subsidize Cranial Neurogenesis',
        scientificRationale: 'BDNF upregulation expands prefrontal synaptic density, driving rapid EQ and eusocial coordination growth.',
        atpDelta: -210,
        stressDelta: -8,
        eusocialityDelta: 11,
        eqDelta: 0.14,
      },
      optionB: {
        label: 'Prioritize Mycelial Bioreactor Yields',
        scientificRationale: 'Redirects Savant labor toward enzymatic substrate fermentation, surging caloric ATP reserves.',
        atpDelta: 340,
        stressDelta: -4,
        eusocialityDelta: 5,
        eqDelta: 0.05,
      },
    };
  }

  return {
    source: 'deterministic-biocompute',
    ethologyReport:
      `At Hamilton Eusociality Index ${eusociality.toFixed(0)}%, reciprocal trophallaxis and shared olfactory MHC-class kinship markers are stabilizing non-reproductive helper castes across the primary warren.`,
    emergentPhenomenon: 'Olfactory MHC Kin-Recognition Trophallaxis',
    causalMechanism: 'Vomeronasal V2R Pheromone Binding & Oxytocinergically Mediated Food Sharing',
    dilemmaTitle: 'Institutionalize Caste Division of Labor',
    dilemmaContext:
      'Forager Scouts and Tunnel Engineers have spontaneously segregated by myostatin allele expression. Formalizing specialized rations will boost thermodynamic efficiency across the burrow.',
    optionA: {
      label: 'Formalize Eusocial Caste Rations',
      scientificRationale: 'Increases Hamilton inclusive fitness (rB > C) and reduces inter-clan dominance hierarchies.',
      atpDelta: 120,
      stressDelta: -10,
      eusocialityDelta: 10,
      eqDelta: 0.08,
    },
    optionB: {
      label: 'Maintain Generalist Phenotypic Plasticity',
      scientificRationale: 'Preserves broad behavioral flexibility and rapid surface foraging bursts while accelerating neural exploration.',
      atpDelta: 220,
      stressDelta: -2,
      eusocialityDelta: 4,
      eqDelta: 0.09,
    },
  };
}

startServer();
