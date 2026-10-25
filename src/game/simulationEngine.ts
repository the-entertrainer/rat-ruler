/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The Rat Ruler — Realistic Rattus norvegicus Ethology, Physiology & Sociobiology Engine
 * Models real wild rodent biology:
 * 1. Kleiber's Allometric Metabolic Scaling (B = B_0 * M^(3/4))
 * 2. Calhoun's Behavioral Sink & Epigenetic NR3C1 Corticosterone Methylation
 * 3. Hamilton's Kin Selection & Inclusive Fitness (rB > C)
 * 4. Knutson's 22-kHz Alarm vs 50-kHz Appetitive Ultrasonic Vocalization Networks
 * 5. Real Quadruped Rodent Physiology (310-480 BPM Heart Rate, 37.5°C Thermoregulation,
 *    8-12 Hz Vibrissae Whisking, Thigmotaxis, Bipedal Rearing, & Allogrooming)
 */

export type CasteRole =
  | 'Ruler'
  | 'Forager'
  | 'Engineer'
  | 'Savant'
  | 'Matriarch'
  | 'Vanguard';

export type ChamberType =
  | 'RoyalThrone'
  | 'MyceliumGranary'
  | 'BioluminescentNursery'
  | 'AcousticSensorium'
  | 'DeepExcavationShaft'
  | 'HydroConduit'
  | 'FermentationVault'
  | 'VanguardBastion';

export type CoatPhenotype =
  | 'Wild Brown Agouti'
  | 'Dark Hooded Agouti'
  | 'Cinnamon Slate'
  | 'Sable Agouti';

export type EthologicalPosture =
  | 'Thigmotactic Tunnel Trotting'
  | 'Bipedal Rearing & Whisking'
  | 'Incisor Soil Excavation'
  | 'Allogrooming Nape & Pelage'
  | 'Thermoregulatory Huddling'
  | 'Olfactory Scent-Trail Tracking';

export interface RatGenome {
  /** FOXP2 ultrasonic syntax & vocalization complexity (0.10 - 1.00) */
  foxp2Syntax: number;
  /** NR3C1 glucocorticoid receptor stress resilience (0.10 - 1.00) */
  nr3c1Resilience: number;
  /** BDNF hippocampal & neocortical neurogenesis rate (0.10 - 1.00) */
  bdnfNeurogenesis: number;
  /** Myostatin musculoskeletal excavation efficiency (0.10 - 1.00) */
  myostatinStrength: number;
  /** Vomeronasal MHC kin-recognition & altruism fidelity (0.10 - 1.00) */
  mhcKinAltruism: number;
}

export interface RatAgent {
  id: string;
  name: string;
  caste: CasteRole;
  sex: 'Buck (♂)' | 'Doe (♀)';
  coatPhenotype: CoatPhenotype;
  posture: EthologicalPosture;
  generation: number;
  ageDays: number;
  massGrams: number;
  /** Real Rattus norvegicus heart rate (310 - 480 BPM) */
  heartRateBpm: number;
  /** Core body temperature in Celsius (37.1 - 38.3 °C) */
  coreTempC: number;
  /** Blood glucose in mg/dL (80 - 145 mg/dL) */
  bloodGlucoseMgDl: number;
  /** Active vibrissae (whisker) sweep frequency in Hz (8.0 - 12.0 Hz) */
  whiskingFreqHz: number;
  /** Daily metabolic demand in kcal computed via Kleiber's Law + cranial load */
  metabolicRateKcal: number;
  /** Epigenetic Corticosterone methylation level (0 = calm, 100 = behavioral sink) */
  corticosteroneStress: number;
  /** Current ultrasonic emission frequency in kHz (~22 kHz alarm or ~50 kHz prosocial) */
  vocalizationKhz: number;
  chamberId: string;
  /** Normalized spatial coordinates (0-100, 0-100) for real-time burrow canvas */
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  headingRad: number;
  activity: string;
  genome: RatGenome;
}

export interface BurrowChamber {
  id: string;
  name: string;
  type: ChamberType;
  level: number;
  depthMeters: number;
  /** Normalized coordinates (0-100, 0-100) on subterranean cross-section */
  x: number;
  y: number;
  connectedTo: string[];
  capacityBonus: number;
  atpProductionPerTick: number;
  myceliumProductionPerTick: number;
  stressMitigationPerTick: number;
  eqBonusPerTick: number;
  excavationCostMycelium: number;
  excavationCostAtp: number;
  scientificPrinciple: string;
  description: string;
}

export interface EmergentEventLog {
  id: string;
  tick: number;
  generation: number;
  category: 'ETHOLOGY' | 'EPIGENETICS' | 'ACOUSTICS' | 'EVOLUTION' | 'DECREE';
  title: string;
  detail: string;
  metricBadge: string;
}

export interface RoyalDecree {
  id: string;
  name: string;
  category: 'Metabolic' | 'Epigenetic' | 'Eusocial' | 'Neurological';
  scientificBasis: string;
  description: string;
  costAtp: number;
  costMycelium: number;
  active: boolean;
  cooldownTicks: number;
  effects: {
    atpMultiplier: number;
    stressDeltaPerTick: number;
    eusocialityDeltaPerTick: number;
    eqDeltaPerTick: number;
  };
}

export interface SupercomputerDilemma {
  ethologyReport: string;
  emergentPhenomenon: string;
  causalMechanism: string;
  dilemmaTitle: string;
  dilemmaContext: string;
  source: string;
  optionA: {
    label: string;
    scientificRationale: string;
    atpDelta: number;
    stressDelta: number;
    eusocialityDelta: number;
    eqDelta: number;
  };
  optionB: {
    label: string;
    scientificRationale: string;
    atpDelta: number;
    stressDelta: number;
    eusocialityDelta: number;
    eqDelta: number;
  };
}

export interface DynastyGenotypePreset {
  id: string;
  name: string;
  latinSubtitle: string;
  summary: string;
  startingTraitBonus: string;
  initialModifiers: {
    atpKcal: number;
    myceliumStock: number;
    encephalization: number;
    eusocialityIndex: number;
  };
}

export interface ColonyState {
  tick: number;
  generation: number;
  dynastyName: string;
  genotypeId: string;
  population: number;
  maxCapacity: number;
  /** Caloric energy reserve in kilocalories (ATP equivalent) */
  atpKcal: number;
  /** Net ATP change per tick */
  netAtpPerTick: number;
  /** Cultivated symbiotic fungus & seed cache biomass in grams */
  myceliumStock: number;
  netMyceliumPerTick: number;
  /** Encephalization Quotient (baseline Rattus norvegicus = 0.52; Singularity target = 2.15) */
  encephalization: number;
  /** Hamilton Inclusive Fitness & Eusociality Index (0 - 100%) */
  eusocialityIndex: number;
  /** Calhoun Behavioral Sink / NR3C1 Methylation Stress Index (0 - 100%) */
  stressIndex: number;
  /** Mean ultrasonic network frequency (22 kHz distress -> 50+ kHz prosocial syntax) */
  dominantFrequencyKhz: number;
  /** Coefficient of genetic relatedness r in Hamilton's rule rB > C (0.12 - 0.85) */
  relatednessR: number;
  epochIndex: number;
  epochName: string;
  chambers: BurrowChamber[];
  agents: RatAgent[];
  decrees: RoyalDecree[];
  logs: EmergentEventLog[];
  activeDilemma: SupercomputerDilemma | null;
  status: 'playing' | 'victory' | 'defeat';
  outcomeReason?: string;
}

export const DYNASTY_GENOTYPES: DynastyGenotypePreset[] = [
  {
    id: 'norvegicus_rex',
    name: 'House Oakheart',
    latinSubtitle: 'Strong Diggers & Hearty Gatherers',
    summary: 'Sturdy woodland rats famous for digging deep halls and storing huge pantries of acorns and cheese.',
    startingTraitBonus: '+25% Mining Speed · +300 Starting Food',
    initialModifiers: {
      atpKcal: 1650,
      myceliumStock: 260,
      encephalization: 0.58,
      eusocialityIndex: 35,
    },
  },
  {
    id: 'glaber_eusocial',
    name: 'House Hearthpaw',
    latinSubtitle: 'Warm Nests & Big Happy Families',
    summary: 'Friendly burrowers who love singing by the lanterns, sharing meals, and keeping every rat cheerful.',
    startingTraitBonus: '+20% Colony Harmony · Less Crowding Worry',
    initialModifiers: {
      atpKcal: 1400,
      myceliumStock: 220,
      encephalization: 0.62,
      eusocialityIndex: 52,
    },
  },
  {
    id: 'foxp2_noosphere',
    name: 'House Starwhisker',
    latinSubtitle: 'Clever Inventors & Tunnel Scouts',
    summary: 'Curious scholars and swift scouts who map secret underground springs and unlock new kingdom lore.',
    startingTraitBonus: '+25% Faster Wisdom · Quick Discovery',
    initialModifiers: {
      atpKcal: 1350,
      myceliumStock: 210,
      encephalization: 0.74,
      eusocialityIndex: 40,
    },
  },
];

export const EVOLUTIONARY_EPOCHS = [
  {
    index: 0,
    name: 'Chapter 1: Humble Root Burrow',
    minEq: 0.5,
    minEusociality: 0,
    description: 'A small band of rats digging their first cozy home beneath the Great Oak tree.',
  },
  {
    index: 1,
    name: 'Chapter 2: Lantern Village',
    minEq: 0.72,
    minEusociality: 35,
    description: 'Neighbors share cheese and berries while tending glowing underground mushroom gardens.',
  },
  {
    index: 2,
    name: 'Chapter 3: Bustling Under-Town',
    minEq: 1.05,
    minEusociality: 52,
    description: 'Skilled Gatherers, Miners, Caretakers, and Guards work together across deep halls.',
  },
  {
    index: 3,
    name: 'Chapter 4: Grand Root Citadel',
    minEq: 1.55,
    minEusociality: 68,
    description: 'Glowing mushroom farms, fresh spring wells, and wise Elders guide a thriving realm.',
  },
  {
    index: 4,
    name: 'Chapter 5: The Golden Rat Kingdom',
    minEq: 2.15,
    minEusociality: 82,
    description: 'Crown Victory! A legendary underground paradise where every rat lives in peace and plenty.',
  },
];

/**
 * Kleiber's Law: Basal Metabolic Rate scales with body mass to the 3/4 power:
 * B = B_0 * (M_kg)^(0.75), adjusted for Encephalization Quotient (brain glucose cost)
 * and caste physical activity multiplier.
 */
export function calculateKleiberMetabolicRate(
  massGrams: number,
  encephalization: number,
  caste: CasteRole
): number {
  const massKg = Math.max(0.05, massGrams / 1000);
  const basalKcal = 72 * Math.pow(massKg, 0.75);
  const cranialFactor = 1 + Math.max(0, encephalization - 0.5) * 0.28;
  const casteActivityFactor: Record<CasteRole, number> = {
    Ruler: 1.15,
    Forager: 1.35,
    Engineer: 1.42,
    Savant: 1.28,
    Matriarch: 1.45,
    Vanguard: 1.38,
  };
  return Number((basalKcal * cranialFactor * casteActivityFactor[caste]).toFixed(2));
}

/**
 * Calhoun's Behavioral Sink & NR3C1 Epigenetic Stress Model:
 * Computes net change in colony stress based on population/capacity density ratio,
 * nursery allogrooming mitigation, and ultrasonic prosocial resonance.
 */
export function calculateCalhounDensityStressDelta(
  population: number,
  maxCapacity: number,
  stressMitigation: number,
  relatednessR: number
): number {
  const safeCap = Math.max(10, maxCapacity);
  const densityRatio = population / safeCap;

  let crowdingPressure = 0;
  if (densityRatio > 0.75) {
    crowdingPressure = Math.pow((densityRatio - 0.75) * 4.2, 1.65) * 4.5;
  } else if (densityRatio < 0.55) {
    crowdingPressure = -1.2;
  } else {
    crowdingPressure = (densityRatio - 0.6) * 3.0;
  }

  const kinshipDamping = (relatednessR - 0.25) * 2.4;
  const delta = crowdingPressure - stressMitigation * 0.32 - kinshipDamping;
  return Number(delta.toFixed(2));
}

/**
 * Hamilton's Rule (rB > C):
 * Evaluates whether altruistic eusocial behavior is evolutionarily favored
 * and computes the resulting Eusociality Index progression.
 */
export function evaluateHamiltonKinSelection(
  relatednessR: number,
  altruisticBenefitB: number,
  individualCostC: number
): { favored: boolean; hamiltonSurplus: number } {
  const rB = relatednessR * altruisticBenefitB;
  const surplus = Number((rB - individualCostC).toFixed(3));
  return {
    favored: surplus > 0,
    hamiltonSurplus: surplus,
  };
}

export function createInitialColonyState(genotypeId = 'norvegicus_rex'): ColonyState {
  const preset =
    DYNASTY_GENOTYPES.find((g) => g.id === genotypeId) || DYNASTY_GENOTYPES[0];

  const chambers: BurrowChamber[] = [
    {
      id: 'chamber_throne',
      name: 'Great Acorn Throne',
      type: 'RoyalThrone',
      level: 1,
      depthMeters: 2.4,
      x: 50,
      y: 27,
      connectedTo: ['chamber_granary', 'chamber_nursery', 'chamber_sensorium'],
      capacityBonus: 18,
      atpProductionPerTick: 45,
      myceliumProductionPerTick: 12,
      stressMitigationPerTick: 3.5,
      eqBonusPerTick: 0.004,
      excavationCostMycelium: 90,
      excavationCostAtp: 280,
      scientificPrinciple: 'Royal Hall • Boosts Colony Housing, Food & Wisdom',
      description: 'The grand oak-root hall where the Rat King welcomes new villagers and inspires the realm.',
    },
    {
      id: 'chamber_granary',
      name: 'Cheese & Berry Pantry',
      type: 'MyceliumGranary',
      level: 1,
      depthMeters: 3.8,
      x: 20,
      y: 45,
      connectedTo: ['chamber_throne', 'chamber_hydro'],
      capacityBonus: 12,
      atpProductionPerTick: 135,
      myceliumProductionPerTick: 28,
      stressMitigationPerTick: 1.0,
      eqBonusPerTick: 0.002,
      excavationCostMycelium: 75,
      excavationCostAtp: 220,
      scientificPrinciple: 'Main Food Kitchen • Produces +Food & +Shrooms every second',
      description: 'Cool wooden shelves stacked high with golden cheese wheels, sweet berries, and roasted acorns.',
    },
    {
      id: 'chamber_nursery',
      name: 'Cozy Straw Nursery',
      type: 'BioluminescentNursery',
      level: 1,
      depthMeters: 3.5,
      x: 80,
      y: 45,
      connectedTo: ['chamber_throne', 'chamber_bastion'],
      capacityBonus: 20,
      atpProductionPerTick: 25,
      myceliumProductionPerTick: 8,
      stressMitigationPerTick: 6.5,
      eqBonusPerTick: 0.005,
      excavationCostMycelium: 85,
      excavationCostAtp: 240,
      scientificPrinciple: 'Family Living Quarters • Adds +Rat Beds & +Happiness',
      description: 'Warm woven straw beds lit by soft blue glow-shrooms where Caretakers raise happy rat pups.',
    },
    {
      id: 'chamber_sensorium',
      name: 'Elder Map & Lore Hall',
      type: 'AcousticSensorium',
      level: 1,
      depthMeters: 5.2,
      x: 50,
      y: 56,
      connectedTo: ['chamber_throne', 'chamber_hydro', 'chamber_excavation'],
      capacityBonus: 10,
      atpProductionPerTick: 20,
      myceliumProductionPerTick: 15,
      stressMitigationPerTick: 4.5,
      eqBonusPerTick: 0.012,
      excavationCostMycelium: 110,
      excavationCostAtp: 310,
      scientificPrinciple: 'Study & Discovery • Unlocks Next Kingdom Chapters Faster',
      description: 'Candlelit library where wise Elders draw tunnel maps and teach clever skills to young rats.',
    },
    {
      id: 'chamber_hydro',
      name: 'Crystal Spring Well',
      type: 'HydroConduit',
      level: 1,
      depthMeters: 6.4,
      x: 20,
      y: 77,
      connectedTo: ['chamber_granary', 'chamber_sensorium', 'chamber_excavation'],
      capacityBonus: 14,
      atpProductionPerTick: 95,
      myceliumProductionPerTick: 34,
      stressMitigationPerTick: 2.5,
      eqBonusPerTick: 0.003,
      excavationCostMycelium: 95,
      excavationCostAtp: 260,
      scientificPrinciple: 'Fresh Water & Garden • Grows +Food & +Glow-Shrooms',
      description: 'Clear underground spring water trickling through oak roots to water our mushroom gardens.',
    },
    {
      id: 'chamber_excavation',
      name: 'Deep Shroom & Stone Mine',
      type: 'DeepExcavationShaft',
      level: 1,
      depthMeters: 8.1,
      x: 50,
      y: 83,
      connectedTo: ['chamber_sensorium', 'chamber_hydro', 'chamber_bastion'],
      capacityBonus: 16,
      atpProductionPerTick: 50,
      myceliumProductionPerTick: 46,
      stressMitigationPerTick: 0.5,
      eqBonusPerTick: 0.004,
      excavationCostMycelium: 80,
      excavationCostAtp: 250,
      scientificPrinciple: 'Main Mining Quarry • Harvests +Shrooms & Building Supplies',
      description: 'Deep lantern-lit quarry where sturdy Miners dig out rich glow-shrooms and building stone.',
    },
    {
      id: 'chamber_bastion',
      name: 'Root Gate Watchtower',
      type: 'VanguardBastion',
      level: 1,
      depthMeters: 6.1,
      x: 80,
      y: 77,
      connectedTo: ['chamber_nursery', 'chamber_excavation'],
      capacityBonus: 12,
      atpProductionPerTick: 40,
      myceliumProductionPerTick: 14,
      stressMitigationPerTick: 4.0,
      eqBonusPerTick: 0.003,
      excavationCostMycelium: 90,
      excavationCostAtp: 270,
      scientificPrinciple: 'Burrow Guardhouse • Keeps the Colony Safe & Calm',
      description: 'Sturdy timber gatehouse with brass warning bells where brave Guards watch over the burrow.',
    },
  ];

  const decrees: RoyalDecree[] = [
    {
      id: 'decree_trophallaxis',
      name: 'Feast of Shared Plenty',
      category: 'Eusocial',
      scientificBasis: '+12% Food Production · Boosts Colony Teamwork & Mood',
      description: 'Gatherers share extra berries, acorns, and cheese with every hungry worker in the burrow.',
      costAtp: 150,
      costMycelium: 40,
      active: true,
      cooldownTicks: 0,
      effects: {
        atpMultiplier: 1.12,
        stressDeltaPerTick: -1.4,
        eusocialityDeltaPerTick: 0.45,
        eqDeltaPerTick: 0.003,
      },
    },
    {
      id: 'decree_allogrooming',
      name: 'Cozy Lantern Rest Hours',
      category: 'Epigenetic',
      scientificBasis: 'Greatly Boosts Colony Happiness · Prevents Overcrowding Worry',
      description: 'Rats gather by warm lanterns for afternoon brushing, stories, and naps.',
      costAtp: 180,
      costMycelium: 50,
      active: false,
      cooldownTicks: 0,
      effects: {
        atpMultiplier: 0.96,
        stressDeltaPerTick: -3.8,
        eusocialityDeltaPerTick: 0.35,
        eqDeltaPerTick: 0.004,
      },
    },
    {
      id: 'decree_ultrasonic_codex',
      name: 'Tunnel Songs & Trail Bells',
      category: 'Neurological',
      scientificBasis: 'Fast Wisdom Growth · +5% Food Production',
      description: 'Scouts hang tiny brass bells and sing cheerful marching songs through the tunnels.',
      costAtp: 220,
      costMycelium: 70,
      active: false,
      cooldownTicks: 0,
      effects: {
        atpMultiplier: 1.05,
        stressDeltaPerTick: -1.8,
        eusocialityDeltaPerTick: 0.55,
        eqDeltaPerTick: 0.011,
      },
    },
    {
      id: 'decree_hypometabolic_torpor',
      name: 'Warm Straw Quilt Huddle',
      category: 'Metabolic',
      scientificBasis: '+28% Food Saved Every Day · Cozy Winter Warmth',
      description: 'Workers curl up together under thick woven straw quilts to save strength and food.',
      costAtp: 120,
      costMycelium: 60,
      active: false,
      cooldownTicks: 0,
      effects: {
        atpMultiplier: 1.28,
        stressDeltaPerTick: 0.6,
        eusocialityDeltaPerTick: 0.15,
        eqDeltaPerTick: -0.001,
      },
    },
  ];

  const initialPopulation = 34;
  const maxCapacity = chambers.reduce((sum, c) => sum + c.capacityBonus, 0);
  const agents = generateInitialAgents(
    initialPopulation,
    chambers,
    preset.initialModifiers.encephalization
  );

  return {
    tick: 1,
    generation: 1,
    dynastyName: preset.name,
    genotypeId: preset.id,
    population: initialPopulation,
    maxCapacity,
    atpKcal: preset.initialModifiers.atpKcal,
    netAtpPerTick: 145,
    myceliumStock: preset.initialModifiers.myceliumStock,
    netMyceliumPerTick: 85,
    encephalization: preset.initialModifiers.encephalization,
    eusocialityIndex: preset.initialModifiers.eusocialityIndex,
    stressIndex: 16,
    dominantFrequencyKhz: 50.4,
    relatednessR: 0.54,
    epochIndex: 1,
    epochName: EVOLUTIONARY_EPOCHS[1].name,
    chambers,
    agents,
    decrees,
    logs: [
      {
        id: 'log_init_1',
        tick: 1,
        generation: 1,
        category: 'ETHOLOGY',
        title: `${preset.name} Founded the Burrow!`,
        detail: `King Barnaby and ${initialPopulation} loyal rats lit the first lanterns beneath the Great Oak tree.`,
        metricBadge: 'Day 1',
      },
      {
        id: 'log_init_2',
        tick: 1,
        generation: 1,
        category: 'ACOUSTICS',
        title: 'Pantry & Shroom Gardens Ready',
        detail: 'Gatherers and Miners have started bringing in fresh berries, cheese, and glow-shrooms.',
        metricBadge: 'Happy Colony',
      },
    ],
    activeDilemma: null,
    status: 'playing',
  };
}

const COAT_PHENOTYPES: CoatPhenotype[] = [
  'Wild Brown Agouti',
  'Wild Brown Agouti',
  'Dark Hooded Agouti',
  'Cinnamon Slate',
  'Sable Agouti',
];

const POSTURES_BY_CASTE: Record<CasteRole, EthologicalPosture[]> = {
  Ruler: ['Bipedal Rearing & Whisking', 'Allogrooming Nape & Pelage', 'Thigmotactic Tunnel Trotting'],
  Forager: ['Olfactory Scent-Trail Tracking', 'Thigmotactic Tunnel Trotting', 'Bipedal Rearing & Whisking'],
  Engineer: ['Incisor Soil Excavation', 'Thigmotactic Tunnel Trotting'],
  Savant: ['Bipedal Rearing & Whisking', 'Olfactory Scent-Trail Tracking'],
  Matriarch: ['Allogrooming Nape & Pelage', 'Thermoregulatory Huddling'],
  Vanguard: ['Bipedal Rearing & Whisking', 'Thigmotactic Tunnel Trotting'],
};

const RAT_VILLAGER_NAMES = [
  'King Barnaby',
  'Rosie',
  'Clover',
  'Professor Pip',
  'Alder',
  'Fern',
  'Bramble',
  'Digby',
  'Flint',
  'Cobble',
  'Captain Thorn',
  'Briar',
  'Cheddar',
  'Nutmeg',
  'Hazel',
  'Biscuit',
  'Fennel',
  'Acorn',
  'Willow',
  'Rusty',
  'Barley',
  'Maple',
  'Pebble',
  'Juniper',
];

function generateInitialAgents(
  count: number,
  chambers: BurrowChamber[],
  encephalization: number
): RatAgent[] {
  const roles: CasteRole[] = [
    'Ruler',
    'Matriarch',
    'Matriarch',
    'Savant',
    'Savant',
    'Savant',
    'Engineer',
    'Engineer',
    'Engineer',
    'Engineer',
    'Vanguard',
    'Vanguard',
    'Forager',
    'Forager',
    'Forager',
    'Forager',
    'Forager',
    'Forager',
  ];

  const agents: RatAgent[] = [];
  const visualAgentCount = Math.min(count, 24);

  for (let i = 0; i < visualAgentCount; i++) {
    const caste: CasteRole = i === 0 ? 'Ruler' : roles[i % roles.length];
    const targetChamber = i === 0 ? chambers[0] : chambers[i % chambers.length];

    const massGrams =
      caste === 'Ruler'
        ? 465
        : caste === 'Matriarch'
          ? 395
          : caste === 'Vanguard'
            ? 430
            : caste === 'Engineer'
              ? 370
              : caste === 'Savant'
                ? 320
                : 290;

    const genome: RatGenome = {
      foxp2Syntax: Number((0.42 + (i % 5) * 0.08).toFixed(2)),
      nr3c1Resilience: Number((0.55 + (i % 4) * 0.09).toFixed(2)),
      bdnfNeurogenesis: Number((0.48 + (i % 6) * 0.07).toFixed(2)),
      myostatinStrength: Number((0.50 + (i % 5) * 0.08).toFixed(2)),
      mhcKinAltruism: Number((0.52 + (i % 4) * 0.10).toFixed(2)),
    };

    const nextChamber =
      chambers.find(
        (c) => c.id === targetChamber.connectedTo[i % targetChamber.connectedTo.length]
      ) || targetChamber;

    const startX = targetChamber.x + ((i % 3) - 1) * 2.2;
    const startY = targetChamber.y + ((i % 2) - 0.5) * 2.2;
    const headingRad = Math.atan2(nextChamber.y - startY, nextChamber.x - startX);
    const postures = POSTURES_BY_CASTE[caste];

    agents.push({
      id: `rat_${i + 1}`,
      name: RAT_VILLAGER_NAMES[i % RAT_VILLAGER_NAMES.length],
      caste,
      sex: caste === 'Matriarch' ? 'Doe (♀)' : i % 2 === 0 ? 'Buck (♂)' : 'Doe (♀)',
      coatPhenotype: COAT_PHENOTYPES[i % COAT_PHENOTYPES.length],
      posture: postures[i % postures.length],
      generation: 1,
      ageDays: 95 + ((i * 19) % 240),
      massGrams,
      heartRateBpm: 325 + ((i * 17) % 95),
      coreTempC: Number((37.4 + (i % 6) * 0.12).toFixed(1)),
      bloodGlucoseMgDl: 96 + ((i * 11) % 36),
      whiskingFreqHz: Number((8.4 + (i % 7) * 0.45).toFixed(1)),
      metabolicRateKcal: calculateKleiberMetabolicRate(massGrams, encephalization, caste),
      corticosteroneStress: 12 + ((i * 5) % 18),
      vocalizationKhz: 48.5 + (i % 7) * 0.9,
      chamberId: targetChamber.id,
      x: startX,
      y: startY,
      targetX: nextChamber.x,
      targetY: nextChamber.y,
      headingRad,
      activity: getActivityForCaste(caste),
      genome,
    });
  }

  return agents;
}

function getActivityForCaste(caste: CasteRole): string {
  switch (caste) {
    case 'Ruler':
      return 'Cheering on workers & guiding the burrow';
    case 'Forager':
      return 'Gathering sweet berries, acorns & cheese';
    case 'Engineer':
      return 'Digging deep tunnels & harvesting glow-shrooms';
    case 'Savant':
      return 'Studying ancient maps & teaching wisdom';
    case 'Matriarch':
      return 'Tending cozy straw nests & caring for pups';
    case 'Vanguard':
      return 'Keeping watch at the wooden root gates';
  }
}

/**
 * Advances the subterranean reality simulation by 1 discrete scientific tick.
 */
export function stepColonySimulation(state: ColonyState): ColonyState {
  if (state.status !== 'playing') {
    return state;
  }

  const nextTick = state.tick + 1;
  const maxCapacity = state.chambers.reduce((sum, c) => sum + c.capacityBonus, 0);

  const activeDecrees = state.decrees.filter((d) => d.active);
  const atpDecreeMult = activeDecrees.reduce(
    (acc, d) => acc * d.effects.atpMultiplier,
    1.0
  );
  const stressDecreeDelta = activeDecrees.reduce(
    (acc, d) => acc + d.effects.stressDeltaPerTick,
    0
  );
  const eusocialDecreeDelta = activeDecrees.reduce(
    (acc, d) => acc + d.effects.eusocialityDeltaPerTick,
    0
  );
  const eqDecreeDelta = activeDecrees.reduce(
    (acc, d) => acc + d.effects.eqDeltaPerTick,
    0
  );

  const rawAtpProd =
    state.chambers.reduce((sum, c) => sum + c.atpProductionPerTick, 0) *
    atpDecreeMult *
    (1 + state.eusocialityIndex * 0.004);

  const rawMyceliumProd =
    state.chambers.reduce((sum, c) => sum + c.myceliumProductionPerTick, 0) *
    (1 + (state.encephalization - 0.5) * 0.25);

  const totalStressMitigation = state.chambers.reduce(
    (sum, c) => sum + c.stressMitigationPerTick,
    0
  );

  const totalChamberEqBonus = state.chambers.reduce(
    (sum, c) => sum + c.eqBonusPerTick,
    0
  );

  const meanRatMetabolicKcal = calculateKleiberMetabolicRate(
    335,
    state.encephalization,
    'Forager'
  );
  const colonyMetabolicBurn = Number((state.population * meanRatMetabolicKcal * 0.14).toFixed(1));
  const netAtpPerTick = Math.round(rawAtpProd - colonyMetabolicBurn);
  const nextAtpKcal = Math.max(0, Math.round(state.atpKcal + netAtpPerTick));

  const netMyceliumPerTick = Math.round(rawMyceliumProd - state.population * 0.45);
  const nextMyceliumStock = Math.max(0, Math.round(state.myceliumStock + netMyceliumPerTick));

  const calhounDelta = calculateCalhounDensityStressDelta(
    state.population,
    maxCapacity,
    totalStressMitigation,
    state.relatednessR
  );
  const starvationStress = nextAtpKcal === 0 ? 12 : nextAtpKcal < 300 ? 4 : 0;
  const nextStressIndex = Math.max(
    2,
    Math.min(100, Number((state.stressIndex + calhounDelta + stressDecreeDelta + starvationStress).toFixed(1)))
  );

  const hamilton = evaluateHamiltonKinSelection(
    state.relatednessR,
    1.8 + totalStressMitigation * 0.05,
    0.75 + nextStressIndex * 0.008
  );
  const hamiltonBoost = hamilton.favored ? 0.55 : -0.35;
  const nextEusociality = Math.max(
    10,
    Math.min(100, Number((state.eusocialityIndex + hamiltonBoost + eusocialDecreeDelta).toFixed(1)))
  );

  const stressPenaltyOnEq = nextStressIndex > 65 ? -0.004 : 0;
  const nextEq = Math.max(
    0.5,
    Math.min(
      2.5,
      Number((state.encephalization + totalChamberEqBonus + eqDecreeDelta + stressPenaltyOnEq).toFixed(3))
    )
  );

  const nextRelatednessR = Math.min(
    0.84,
    Number((0.42 + (nextEusociality / 100) * 0.38).toFixed(2))
  );

  const nextFreqKhz =
    nextStressIndex > 60
      ? Number((22.4 + (100 - nextStressIndex) * 0.18).toFixed(1))
      : Number((48.0 + nextEq * 5.2 - nextStressIndex * 0.08).toFixed(1));

  let nextPopulation = state.population;
  if (nextAtpKcal > 250 && nextStressIndex < 72 && state.population < maxCapacity) {
    const growthStep = nextTick % 2 === 0 ? 2 : 1;
    nextPopulation = Math.min(maxCapacity, state.population + growthStep);
  } else if (nextAtpKcal === 0 || nextStressIndex > 88) {
    nextPopulation = Math.max(0, state.population - 3);
  }

  const nextGeneration = 1 + Math.floor(nextTick / 6);

  let activeEpoch = EVOLUTIONARY_EPOCHS[0];
  for (const ep of EVOLUTIONARY_EPOCHS) {
    if (nextEq >= ep.minEq && nextEusociality >= ep.minEusociality) {
      activeEpoch = ep;
    }
  }

  const updatedAgents = state.agents.map((agent, idx) => {
    const dx = agent.targetX - agent.x;
    const dy = agent.targetY - agent.y;
    const dist = Math.hypot(dx, dy);

    let x = agent.x;
    let y = agent.y;
    let targetX = agent.targetX;
    let targetY = agent.targetY;
    let chamberId = agent.chamberId;
    let headingRad = agent.headingRad;

    if (dist < 4.0) {
      const currentChamber =
        state.chambers.find((c) => c.id === agent.chamberId) || state.chambers[0];
      const nextChamberId =
        currentChamber.connectedTo[(nextTick + idx) % currentChamber.connectedTo.length] ||
        currentChamber.id;
      const destChamber =
        state.chambers.find((c) => c.id === nextChamberId) || currentChamber;
      chamberId = destChamber.id;
      targetX = destChamber.x + ((idx % 3) - 1) * 2.5;
      targetY = destChamber.y + ((idx % 2) - 0.5) * 2.5;
      headingRad = Math.atan2(targetY - y, targetX - x);
    } else {
      const stepSpeed = 3.4;
      x = Number((agent.x + (dx / dist) * stepSpeed).toFixed(2));
      y = Number((agent.y + (dy / dist) * stepSpeed).toFixed(2));
      headingRad = Math.atan2(dy, dx);
    }

    const updatedGenome: RatGenome = {
      foxp2Syntax: Math.min(1, Number((agent.genome.foxp2Syntax + 0.003).toFixed(3))),
      nr3c1Resilience: Math.min(
        1,
        Math.max(0.1, Number((agent.genome.nr3c1Resilience + (nextStressIndex < 35 ? 0.004 : -0.002)).toFixed(3)))
      ),
      bdnfNeurogenesis: Math.min(1, Number((agent.genome.bdnfNeurogenesis + 0.004).toFixed(3))),
      myostatinStrength: agent.genome.myostatinStrength,
      mhcKinAltruism: Math.min(1, Number((agent.genome.mhcKinAltruism + 0.003).toFixed(3))),
    };

    const postures = POSTURES_BY_CASTE[agent.caste];
    const nextPosture = postures[(nextTick + idx) % postures.length];

    return {
      ...agent,
      posture: nextPosture,
      generation: nextGeneration,
      ageDays: agent.ageDays + 4,
      heartRateBpm: Math.round(320 + nextStressIndex * 1.4 + (idx % 5) * 8),
      coreTempC: Number((37.3 + (nextStressIndex > 60 ? 0.6 : 0.2)).toFixed(1)),
      bloodGlucoseMgDl: Math.round(Math.max(70, Math.min(155, 95 + netAtpPerTick * 0.15))),
      whiskingFreqHz: Number((8.5 + nextEq * 1.1).toFixed(1)),
      metabolicRateKcal: calculateKleiberMetabolicRate(agent.massGrams, nextEq, agent.caste),
      corticosteroneStress: Math.round(
        Math.max(5, Math.min(99, nextStressIndex * (1.15 - updatedGenome.nr3c1Resilience * 0.4)))
      ),
      vocalizationKhz: nextFreqKhz,
      chamberId,
      x,
      y,
      targetX,
      targetY,
      headingRad,
      genome: updatedGenome,
    };
  });

  const newLogs = [...state.logs];
  if (activeEpoch.index > state.epochIndex) {
    newLogs.unshift({
      id: `log_epoch_${nextTick}`,
      tick: nextTick,
      generation: nextGeneration,
      category: 'EVOLUTION',
      title: `New Kingdom Era: ${activeEpoch.name}`,
      detail: activeEpoch.description,
      metricBadge: `Wisdom ${nextEq.toFixed(1)}`,
    });
  } else if (nextStressIndex > 65 && state.stressIndex <= 65) {
    newLogs.unshift({
      id: `log_stress_${nextTick}`,
      tick: nextTick,
      generation: nextGeneration,
      category: 'EPIGENETICS',
      title: 'Overcrowded Tunnels Warning!',
      detail: 'The burrow is getting crowded and rats are feeling grumpy. Upgrade rooms or pass the Mutual Grooming Hour law!',
      metricBadge: `Mood ${(100 - nextStressIndex).toFixed(0)}%`,
    });
  } else if (nextTick % 5 === 0) {
    newLogs.unshift({
      id: `log_tick_${nextTick}`,
      tick: nextTick,
      generation: nextGeneration,
      category: 'ETHOLOGY',
      title: `Day ${nextTick} Kingdom Report`,
      detail: `Happy squeaks echo through the tunnels! Gatherers stored fresh berries and acorns while pups played in the nursery.`,
      metricBadge: `Rats ${nextPopulation}/${maxCapacity}`,
    });
  }

  let status: ColonyState['status'] = 'playing';
  let outcomeReason: string | undefined;

  if (nextEq >= 2.15 && nextEusociality >= 80 && nextPopulation >= 65) {
    status = 'victory';
    outcomeReason =
      'Your burrow has blossomed into the legendary Golden Rat Kingdom! Every chamber overflows with cheese, glowing shrooms, and joyful families.';
  } else if (nextPopulation <= 5 || nextStressIndex >= 98) {
    status = 'defeat';
    outcomeReason =
      nextStressIndex >= 98
        ? 'The burrow became too crowded and unhappy, causing the clan to scatter into the forest.'
        : 'The royal pantry ran out of food, and the clan had to abandon the burrow in search of berries.';
  }

  return {
    ...state,
    tick: nextTick,
    generation: nextGeneration,
    population: nextPopulation,
    maxCapacity,
    atpKcal: nextAtpKcal,
    netAtpPerTick,
    myceliumStock: nextMyceliumStock,
    netMyceliumPerTick,
    encephalization: nextEq,
    eusocialityIndex: nextEusociality,
    stressIndex: nextStressIndex,
    dominantFrequencyKhz: nextFreqKhz,
    relatednessR: nextRelatednessR,
    epochIndex: activeEpoch.index,
    epochName: activeEpoch.name,
    agents: updatedAgents,
    logs: newLogs.slice(0, 25),
    status,
    outcomeReason,
  };
}

export function upgradeBurrowChamber(
  state: ColonyState,
  chamberId: string
): { nextState: ColonyState; success: boolean; message: string } {
  const chamber = state.chambers.find((c) => c.id === chamberId);
  if (!chamber) {
    return { nextState: state, success: false, message: 'Room not found.' };
  }

  if (
    state.myceliumStock < chamber.excavationCostMycelium ||
    state.atpKcal < chamber.excavationCostAtp
  ) {
    return {
      nextState: state,
      success: false,
      message: `Not enough supplies! Need ${chamber.excavationCostAtp} Food and ${chamber.excavationCostMycelium} Shrooms.`,
    };
  }

  const nextLevel = chamber.level + 1;
  const updatedChambers = state.chambers.map((c) => {
    if (c.id !== chamberId) return c;
    return {
      ...c,
      level: nextLevel,
      capacityBonus: Math.round(c.capacityBonus * 1.32),
      atpProductionPerTick: Math.round(c.atpProductionPerTick * 1.28),
      myceliumProductionPerTick: Math.round(c.myceliumProductionPerTick * 1.28),
      stressMitigationPerTick: Number((c.stressMitigationPerTick * 1.25).toFixed(1)),
      eqBonusPerTick: Number((c.eqBonusPerTick * 1.3).toFixed(4)),
      excavationCostMycelium: Math.round(c.excavationCostMycelium * 1.45),
      excavationCostAtp: Math.round(c.excavationCostAtp * 1.45),
    };
  });

  const maxCapacity = updatedChambers.reduce((sum, c) => sum + c.capacityBonus, 0);

  const newLog: EmergentEventLog = {
    id: `log_upg_${state.tick}_${chamberId}`,
    tick: state.tick,
    generation: state.generation,
    category: 'ETHOLOGY',
    title: `Upgraded ${chamber.name} to Lv.${nextLevel}!`,
    detail: `Miner rats expanded the wooden beams and lanterns. Burrow capacity grew to ${maxCapacity} rats!`,
    metricBadge: `Lv.${nextLevel}`,
  };

  const nextState = stepColonySimulation({
    ...state,
    atpKcal: state.atpKcal - chamber.excavationCostAtp,
    myceliumStock: state.myceliumStock - chamber.excavationCostMycelium,
    maxCapacity,
    chambers: updatedChambers,
    logs: [newLog, ...state.logs].slice(0, 25),
  });

  return {
    nextState,
    success: true,
    message: `${chamber.name} upgraded to Lv.${nextLevel}!`,
  };
}

export function toggleRoyalDecree(
  state: ColonyState,
  decreeId: string
): { nextState: ColonyState; success: boolean; message: string } {
  const decree = state.decrees.find((d) => d.id === decreeId);
  if (!decree) {
    return { nextState: state, success: false, message: 'Royal Law not found.' };
  }

  if (!decree.active) {
    if (state.atpKcal < decree.costAtp || state.myceliumStock < decree.costMycelium) {
      return {
        nextState: state,
        success: false,
        message: `Need ${decree.costAtp} Food and ${decree.costMycelium} Shrooms to pass this Royal Law.`,
      };
    }
  }

  const nextActive = !decree.active;
  const updatedDecrees = state.decrees.map((d) =>
    d.id === decreeId ? { ...d, active: nextActive } : d
  );

  const newLog: EmergentEventLog = {
    id: `log_decree_${state.tick}_${decreeId}`,
    tick: state.tick,
    generation: state.generation,
    category: 'DECREE',
    title: `${nextActive ? 'Passed' : 'Repealed'} Royal Law: ${decree.name}`,
    detail: decree.scientificBasis,
    metricBadge: nextActive ? 'ACTIVE' : 'OFF',
  };

  return {
    nextState: {
      ...state,
      atpKcal: nextActive ? state.atpKcal - decree.costAtp : state.atpKcal,
      myceliumStock: nextActive
        ? state.myceliumStock - decree.costMycelium
        : state.myceliumStock,
      decrees: updatedDecrees,
      logs: [newLog, ...state.logs].slice(0, 25),
    },
    success: true,
    message: `${decree.name} ${nextActive ? 'passed' : 'repealed'}!`,
  };
}

export function resolveSupercomputerDilemma(
  state: ColonyState,
  choice: 'A' | 'B'
): ColonyState {
  if (!state.activeDilemma) return state;

  const selected =
    choice === 'A' ? state.activeDilemma.optionA : state.activeDilemma.optionB;

  const nextAtp = Math.max(0, Math.round(state.atpKcal + selected.atpDelta));
  const nextStress = Math.max(
    2,
    Math.min(100, Number((state.stressIndex + selected.stressDelta).toFixed(1)))
  );
  const nextEusociality = Math.max(
    10,
    Math.min(100, Number((state.eusocialityIndex + selected.eusocialityDelta).toFixed(1)))
  );
  const nextEq = Math.max(
    0.5,
    Math.min(2.5, Number((state.encephalization + selected.eqDelta).toFixed(3)))
  );

  let activeEpoch = EVOLUTIONARY_EPOCHS[0];
  for (const ep of EVOLUTIONARY_EPOCHS) {
    if (nextEq >= ep.minEq && nextEusociality >= ep.minEusociality) {
      activeEpoch = ep;
    }
  }

  const newLog: EmergentEventLog = {
    id: `log_dilemma_${state.tick}`,
    tick: state.tick,
    generation: state.generation,
    category: 'EVOLUTION',
    title: `Royal Council Decision: ${selected.label}`,
    detail: selected.scientificRationale,
    metricBadge: `Wisdom ${nextEq.toFixed(1)}`,
  };

  return {
    ...state,
    atpKcal: nextAtp,
    stressIndex: nextStress,
    eusocialityIndex: nextEusociality,
    encephalization: nextEq,
    epochIndex: activeEpoch.index,
    epochName: activeEpoch.name,
    activeDilemma: null,
    logs: [newLog, ...state.logs].slice(0, 25),
  };
}

const ROYAL_COUNCIL_DILEMMAS: SupercomputerDilemma[] = [
  {
    ethologyReport: 'Gatherers discovered a giant wheel of aged farmhouse cheddar near the old root cellar!',
    emergentPhenomenon: 'The Great Cheddar Discovery',
    causalMechanism: 'Sharing the cheese fairly boosts burrow mood and stocks the pantry.',
    dilemmaTitle: 'The Farmhouse Cheddar Wheel',
    dilemmaContext:
      'Scout Clover and her gatherers rolled a massive wheel of golden cheese to the burrow gates! Should we host a Royal Cheese Feast tonight or store it all in the pantry?',
    source: 'Elder Whiskers • Royal Council',
    optionA: {
      label: 'Store in the Royal Pantry (+400 Food)',
      scientificRationale: 'Carefully slicing and storing the cheese fills the pantry for many days.',
      atpDelta: 400,
      stressDelta: -4,
      eusocialityDelta: 4,
      eqDelta: 0.03,
    },
    optionB: {
      label: 'Host a Grand Burrow Feast (+220 Food & Big Mood Boost!)',
      scientificRationale: 'Every villager shares warm cheese and berry cider, filling the tunnels with happy squeaks!',
      atpDelta: 220,
      stressDelta: -16,
      eusocialityDelta: 8,
      eqDelta: 0.05,
    },
  },
  {
    ethologyReport: 'Miners broke into a sparkling cavern filled with glowing blue lanterns-shrooms!',
    emergentPhenomenon: 'The Glowing Cavern',
    causalMechanism: 'Studying the cavern teaches the clan elders new building secrets.',
    dilemmaTitle: 'Secret of the Glow-Shroom Cavern',
    dilemmaContext:
      'Digger Rusty’s mining crew uncovered an ancient root cavern lit by giant blue glow-shrooms. How should the clan use this discovery?',
    source: 'Professor Pip • Lantern Library',
    optionA: {
      label: 'Harvest Fresh Snacks & Shrooms (+320 Food)',
      scientificRationale: 'Gatherers harvest sweet mushroom caps and roots to stock the burrow.',
      atpDelta: 320,
      stressDelta: -6,
      eusocialityDelta: 5,
      eqDelta: 0.03,
    },
    optionB: {
      label: 'Build a Scholarly Study Hall (+Wisdom & Unity)',
      scientificRationale: 'Clan Elders set up scrolls and lanterns, greatly boosting clan wisdom!',
      atpDelta: 150,
      stressDelta: -10,
      eusocialityDelta: 10,
      eqDelta: 0.08,
    },
  },
];

export function triggerSupercomputerDilemma(state: ColonyState): ColonyState {
  const chosen =
    ROYAL_COUNCIL_DILEMMAS[state.tick % ROYAL_COUNCIL_DILEMMAS.length];
  return {
    ...state,
    activeDilemma: chosen,
  };
}

