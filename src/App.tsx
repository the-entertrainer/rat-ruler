/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ColonyState,
  CasteRole,
  EVOLUTIONARY_EPOCHS,
  createInitialColonyState,
  resolveSupercomputerDilemma,
  stepColonySimulation,
  toggleRoyalDecree,
  triggerSupercomputerDilemma,
  upgradeBurrowChamber,
} from './game/simulationEngine';
import { GameAssetPack, getGameAssetPack } from './game/assetGenerator';
import { BurrowCanvas } from './components/BurrowCanvas';
import { pixelateImageToCanvas } from './game/spriteSheetEngine';

type MobileTab = 'burrow' | 'clan' | 'decrees' | 'goal';

interface RoyalQuest {
  id: string;
  stepNumber: number;
  title: string;
  instruction: string;
  hint: string;
  targetChamberId?: string;
  targetTab?: MobileTab;
  rewardFood: number;
  rewardShrooms: number;
  isComplete: (state: ColonyState, hasInspectedRat: boolean) => boolean;
}

const ROYAL_QUESTS: RoyalQuest[] = [
  {
    id: 'quest_pantry',
    stepNumber: 1,
    title: 'Stock the Royal Pantry',
    instruction:
      'Tap the Cheese & Berry Pantry and expand it to Lv.2 to feed your growing rat clan.',
    hint: 'Expanding the Pantry boosts Food harvests every day!',
    targetChamberId: 'chamber_granary',
    rewardFood: 350,
    rewardShrooms: 160,
    isComplete: (state) => {
      const pantry = state.chambers.find((c) => c.id === 'chamber_granary');
      return Boolean(pantry && pantry.level >= 2);
    },
  },
  {
    id: 'quest_inspect_rat',
    stepNumber: 2,
    title: 'Greet a Clan Subject',
    instruction:
      'Tap any rat scurrying inside the burrow halls (or open the Clan Subjects view) to check their duty and mood.',
    hint: 'Every subject has a name, calling, favorite snack, and mood!',
    targetTab: 'clan',
    rewardFood: 300,
    rewardShrooms: 180,
    isComplete: (_state, hasInspectedRat) => hasInspectedRat,
  },
  {
    id: 'quest_mine',
    stepNumber: 3,
    title: 'Expand the Glow-Shroom Mine',
    instruction:
      'Tap the Deep Shroom & Stone Mine at the bottom of the burrow and expand it to Lv.2.',
    hint: 'Miners gather Glow-Shrooms needed to dig and fortify halls!',
    targetChamberId: 'chamber_excavation',
    rewardFood: 450,
    rewardShrooms: 260,
    isComplete: (state) => {
      const mine = state.chambers.find((c) => c.id === 'chamber_excavation');
      return Boolean(mine && mine.level >= 2);
    },
  },
  {
    id: 'quest_law',
    stepNumber: 4,
    title: 'Enact a Royal Law',
    instruction:
      'Open the Royal Laws scroll at the bottom and pass any helpful law for your burrow.',
    hint: 'Royal Laws boost food gathering, happiness, or scholarly wisdom!',
    targetTab: 'decrees',
    rewardFood: 500,
    rewardShrooms: 300,
    isComplete: (state) => state.decrees.some((d) => d.active),
  },
  {
    id: 'quest_throne',
    stepNumber: 5,
    title: 'Glorify the Great Acorn Throne',
    instruction:
      'Expand the Great Acorn Throne to Lv.2 and grow your clan to 46 Rats!',
    hint: 'Expand the Cozy Straw Nursery if you need more beds for rat pups!',
    targetChamberId: 'chamber_throne',
    rewardFood: 900,
    rewardShrooms: 550,
    isComplete: (state) => {
      const throne = state.chambers.find((c) => c.id === 'chamber_throne');
      return Boolean(throne && throne.level >= 2 && state.population >= 46);
    },
  },
];

const FRIENDLY_JOB_NAMES: Record<
  CasteRole,
  { title: string; badgeColor: string; roleDesc: string }
> = {
  Ruler: {
    title: 'Rat King',
    badgeColor: 'bg-amber-900/90 text-amber-200 border-amber-500',
    roleDesc: 'Wears the Acorn Crown and inspires the burrow.',
  },
  Forager: {
    title: 'Gatherer',
    badgeColor: 'bg-emerald-900/90 text-emerald-200 border-emerald-500',
    roleDesc: 'Collects sweet berries, seeds, and golden cheese.',
  },
  Engineer: {
    title: 'Tunnel Miner',
    badgeColor: 'bg-orange-900/90 text-orange-200 border-orange-500',
    roleDesc: 'Digs cozy halls and harvests glowing shrooms.',
  },
  Savant: {
    title: 'Clan Elder',
    badgeColor: 'bg-sky-900/90 text-sky-200 border-sky-500',
    roleDesc: 'Teaches young rats stories, maps, and wisdom.',
  },
  Matriarch: {
    title: 'Caretaker',
    badgeColor: 'bg-pink-900/90 text-pink-200 border-pink-500',
    roleDesc: 'Tends warm straw beds and raises happy rat pups.',
  },
  Vanguard: {
    title: 'Gate Guard',
    badgeColor: 'bg-red-900/90 text-red-200 border-red-500',
    roleDesc: 'Protects the oak root entrance from owls and foxes.',
  },
};

function RoyalBackdropCanvas({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const quantized = pixelateImageToCanvas(img, 240, 140);
      canvas.width = quantized.width;
      canvas.height = quantized.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(quantized, 0, 0);
      }
    };
    img.src = src;
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

export default function App() {
  const [colony, setColony] = useState<ColonyState>(() => createInitialColonyState());
  const [assets] = useState<GameAssetPack>(() => getGameAssetPack());

  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MobileTab>('burrow');
  const [selectedChamberId, setSelectedChamberId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [autoSimRunning, setAutoSimRunning] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Quest & Player Guidance state
  const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>([]);
  const [hasInspectedRat, setHasInspectedRat] = useState<boolean>(false);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Automatic Day Tick Loop
  useEffect(() => {
    if (!gameStarted || !autoSimRunning || colony.status !== 'playing') return;
    const interval = setInterval(() => {
      setColony((prev) => {
        if (prev.activeDilemma) return prev;
        return stepColonySimulation(prev);
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [gameStarted, autoSimRunning, colony.status]);

  const selectedChamber = useMemo(
    () => colony.chambers.find((c) => c.id === selectedChamberId) || colony.chambers[0],
    [colony.chambers, selectedChamberId]
  );

  const selectedAgent = useMemo(
    () => colony.agents.find((a) => a.id === selectedAgentId) || colony.agents[0],
    [colony.agents, selectedAgentId]
  );

  // Active Quest calculation
  const currentQuest = useMemo(() => {
    return (
      ROYAL_QUESTS.find((q) => !claimedQuestIds.includes(q.id)) ||
      ROYAL_QUESTS[ROYAL_QUESTS.length - 1]
    );
  }, [claimedQuestIds]);

  const allQuestsClaimed = claimedQuestIds.length >= ROYAL_QUESTS.length;
  const isCurrentQuestReadyToClaim =
    !allQuestsClaimed && currentQuest.isComplete(colony, hasInspectedRat);

  // Overall Kingdom Goal Progress (0 - 100%)
  const kingdomGoalProgress = useMemo(() => {
    const popScore = Math.min(1, colony.population / 60) * 35;
    const questScore = (claimedQuestIds.length / ROYAL_QUESTS.length) * 35;
    const totalRoomLevels = colony.chambers.reduce((acc, c) => acc + c.level, 0);
    const buildScore = Math.min(1, Math.max(0, (totalRoomLevels - 7) / 6)) * 30;
    return Math.min(100, Math.round(popScore + questScore + buildScore));
  }, [colony.population, colony.chambers, claimedQuestIds.length]);

  const getCastePortrait = (caste: CasteRole): string => {
    return assets.castePortraits[caste];
  };

  const getChamberArtwork = (chamberId: string): string => {
    const chamber = colony.chambers.find((c) => c.id === chamberId);
    if (!chamber) return assets.chamberArt.RoyalThrone;
    return assets.chamberArt[chamber.type] || assets.chamberArt.RoyalThrone;
  };

  const handleClaimQuest = () => {
    if (!currentQuest || claimedQuestIds.includes(currentQuest.id)) return;
    setClaimedQuestIds((prev) => [...prev, currentQuest.id]);
    setColony((prev) => ({
      ...prev,
      atpKcal: prev.atpKcal + currentQuest.rewardFood,
      myceliumStock: prev.myceliumStock + currentQuest.rewardShrooms,
    }));
    setToastMessage(
      `Quest Fulfilled! +${currentQuest.rewardFood} Food & +${currentQuest.rewardShrooms} Shrooms!`
    );
  };

  const handleGuideMeToQuest = () => {
    if (allQuestsClaimed) {
      setActiveTab('goal');
      return;
    }
    if (currentQuest.targetChamberId) {
      setActiveTab('burrow');
      setSelectedChamberId(currentQuest.targetChamberId);
      setIsDrawerOpen(true);
    } else if (currentQuest.targetTab) {
      if (currentQuest.id === 'quest_inspect_rat') {
        setHasInspectedRat(true);
      }
      setActiveTab(currentQuest.targetTab);
    }
  };

  const handleSelectChamberFromCanvas = (chamberId: string) => {
    setSelectedChamberId(chamberId);
    setIsDrawerOpen(true);
  };

  const handleSelectAgentFromCanvas = (agentId: string) => {
    setSelectedAgentId(agentId);
    setHasInspectedRat(true);
    setActiveTab('clan');
  };

  const handleAdvanceDay = () => {
    setColony((prev) => stepColonySimulation(prev));
    setToastMessage('A new dawn breaks in the burrow! Gatherers brought fresh food.');
  };

  const handleUpgradeChamber = (chamberId: string) => {
    const result = upgradeBurrowChamber(colony, chamberId);
    setColony(result.nextState);
    setToastMessage(result.message);
  };

  const handleToggleDecree = (decreeId: string) => {
    const result = toggleRoyalDecree(colony, decreeId);
    setColony(result.nextState);
    setToastMessage(result.message);
  };

  const handleConsultCouncil = () => {
    setColony((prev) => triggerSupercomputerDilemma(prev));
  };

  const handleResolveDilemma = (choice: 'A' | 'B') => {
    setColony((prev) => resolveSupercomputerDilemma(prev, choice));
    setToastMessage('Your Royal Decree was carried out across the burrow!');
  };

  const handleResetGame = () => {
    setColony(createInitialColonyState());
    setClaimedQuestIds([]);
    setHasInspectedRat(false);
    setIsDrawerOpen(false);
    setToastMessage('A new Rat Clan has founded a cozy burrow beneath the Great Oak!');
  };

  const happinessPercent = Math.max(5, Math.min(100, Math.round(100 - colony.stressIndex)));
  const wisdomScore = colony.encephalization.toFixed(2);

  // ---------------------------------------------------------------------------
  // ROYAL TITLE SCREEN (100% DIEGETIC & 2D SPRITE BRANDED)
  // ---------------------------------------------------------------------------
  if (!gameStarted) {
    return (
      <div className="relative w-screen h-dvh overflow-hidden bg-[#120b07] text-[#fef3c7] select-none flex flex-col justify-between">
        {/* Background Scene */}
        <div className="absolute inset-0">
          <RoyalBackdropCanvas src={assets.titleBackdrop} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120b07] via-[#120b07]/65 to-[#120b07]/35" />
        </div>

        {/* Top Royal Herald Banner */}
        <header className="relative z-10 flex items-center justify-between px-4 pt-3 sm:px-8 sm:pt-5">
          <div
            className="flex items-center gap-2.5 bg-[#23150d] border-2 border-[#c88a36] px-3 py-1.5 pixel-panel bg-cover bg-center"
            style={{ backgroundImage: `url(${assets.uiSprites.parchmentBanner})` }}
          >
            <img
              src={assets.crestEmblem}
              alt="Crown"
              className="w-6 h-6 object-cover border border-[#fbbf24]"
            />
            <span className="text-xs font-bold tracking-wider uppercase text-[#fffbeb] drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
              Chronicles of the Great Oak
            </span>
          </div>

          <div
            className="flex items-center gap-2 bg-[#23150d] border-2 border-[#c88a36] px-3 py-1.5 text-xs font-mono text-[#fef08a] pixel-panel bg-cover bg-center"
            style={{ backgroundImage: `url(${assets.uiSprites.woodButtonGold})` }}
          >
            <img
              src={assets.uiSprites.iconHornEvent}
              alt=""
              className="w-5 h-5 object-cover border border-[#fbbf24]"
            />
            <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] font-bold">
              ROYAL CHARTER
            </span>
          </div>
        </header>

        {/* Center Wordmark Logo, King Portrait & Royal Charter */}
        <main className="relative z-10 flex flex-col items-center text-center px-4 max-w-xl mx-auto my-auto">
          {/* Official 2D Sprite Wordmark Banner + King Barnaby Portrait */}
          <div className="relative flex flex-col items-center mb-2">
            <div className="relative mb-2">
              <img
                src={assets.castePortraits.Ruler}
                alt="King Barnaby"
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover border-4 border-[#fbbf24] shadow-[0_6px_0_#090503]"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#92400e] border-2 border-[#fde68a] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
                King Barnaby
              </span>
            </div>

            {/* Official 2D Game Sprite Wordmark Plaque */}
            <div className="relative w-80 sm:w-[420px] h-24 sm:h-28 border-4 border-[#fbbf24] shadow-[0_6px_0_#090503] overflow-hidden mb-1 bg-[#1e120b]">
              <img
                src={assets.uiSprites.wordmarkLogo}
                alt="The Rat Ruler"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f08]/60 via-[#1a0f08]/45 to-[#1a0f08]/75 flex items-center justify-between px-4 sm:px-6">
                <img
                  src={assets.crestEmblem}
                  alt=""
                  className="w-11 h-11 sm:w-12 sm:h-12 object-cover border-2 border-[#fbbf24] shadow-md shrink-0"
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#fde68a] drop-shadow-[0_2px_0_#090503]">
                    Crown of the Oak Roots
                  </span>
                  <h1 className="font-display text-2xl sm:text-4xl font-black tracking-wider text-[#fffbeb] drop-shadow-[0_4px_0_#090503]">
                    THE RAT RULER
                  </h1>
                </div>
                <img
                  src={assets.crestEmblem}
                  alt=""
                  className="w-11 h-11 sm:w-12 sm:h-12 object-cover border-2 border-[#fbbf24] shadow-md shrink-0"
                />
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#fde68a]/95 max-w-md leading-relaxed mb-3 drop-shadow-[0_1px_2px_#000]">
            Dig cozy halls beneath the ancient oak roots, gather golden cheese &amp; glowing mushrooms, pass royal laws, and lead your clan to the Golden Rat Kingdom.
          </p>

          {/* Royal Charter Card with 2D Sprite Panel Texture */}
          <div
            className="w-full bg-[#1e120b]/95 border-2 border-[#c88a36] p-3 mb-4 text-left pixel-panel relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(24, 14, 8, 0.88), rgba(24, 14, 8, 0.92)), url(${assets.uiSprites.parchmentBanner})`,
              backgroundSize: 'cover',
            }}
          >
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#6b4628]">
              <img
                src={assets.crestEmblem}
                alt=""
                className="w-5 h-5 object-cover border border-[#fbbf24]"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#fbbf24]">
                Royal Charter of the Acorn Crown
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-[#140c07]/90 border border-[#6b4628] p-2 flex items-start gap-2">
                <img
                  src={assets.uiSprites.tabBurrow}
                  alt=""
                  className="w-7 h-7 object-cover border border-[#fbbf24] shrink-0 mt-0.5"
                />
                <div>
                  <div className="font-bold text-[#fde68a]">1. Expand Halls</div>
                  <div className="text-[11px] text-[#d6bfa6] mt-0.5">
                    Tap halls in your burrow to expand pantries, mines &amp; nurseries.
                  </div>
                </div>
              </div>
              <div className="bg-[#140c07]/90 border border-[#6b4628] p-2 flex items-start gap-2">
                <img
                  src={assets.uiSprites.tabClan}
                  alt=""
                  className="w-7 h-7 object-cover border border-[#34d399] shrink-0 mt-0.5"
                />
                <div>
                  <div className="font-bold text-[#6ee7b7]">2. Care for Clan</div>
                  <div className="text-[11px] text-[#d6bfa6] mt-0.5">
                    Keep Food stocked and Mood joyful so new rat pups join the clan.
                  </div>
                </div>
              </div>
              <div className="bg-[#140c07]/90 border border-[#6b4628] p-2 flex items-start gap-2">
                <img
                  src={assets.uiSprites.tabQuests}
                  alt=""
                  className="w-7 h-7 object-cover border border-[#fbbf24] shrink-0 mt-0.5"
                />
                <div>
                  <div className="font-bold text-[#fcd34d]">3. Fulfill Quests</div>
                  <div className="text-[11px] text-[#d6bfa6] mt-0.5">
                    Complete Elder Whiskers&apos; tasks to reach the Golden Rat Kingdom!
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            data-testid="enter-warren-btn"
            onClick={() => setGameStarted(true)}
            style={{
              backgroundImage: `linear-gradient(rgba(180, 83, 9, 0.78), rgba(146, 64, 14, 0.88)), url(${assets.uiSprites.woodButtonGold})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className="w-full sm:w-auto min-w-[280px] py-3.5 px-8 text-[#fffbeb] font-display font-black text-base uppercase tracking-wider border-2 border-[#fef08a] pixel-button transition cursor-pointer flex items-center justify-center gap-3 shadow-lg"
          >
            <img
              src={assets.crestEmblem}
              alt=""
              className="w-6 h-6 object-cover border border-[#fef08a]"
            />
            <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.95)]">
              Enter Your Rat Kingdom
            </span>
          </button>
        </main>

        {/* Bottom Royal Subjects Banner */}
        <footer className="relative z-10 px-4 pb-3 sm:px-8 sm:pb-5 flex items-center justify-center">
          <div
            className="flex items-center gap-3 bg-[#1e120b]/95 border-2 border-[#85582a] px-4 py-2 pixel-panel"
            style={{
              backgroundImage: `linear-gradient(rgba(28, 17, 10, 0.9), rgba(28, 17, 10, 0.92)), url(${assets.uiSprites.parchmentBanner})`,
              backgroundSize: 'cover',
            }}
          >
            <div className="flex -space-x-1">
              <img
                src={assets.castePortraits.Forager}
                alt=""
                className="w-8 h-8 border-2 border-[#fbbf24] object-cover"
              />
              <img
                src={assets.castePortraits.Engineer}
                alt=""
                className="w-8 h-8 border-2 border-[#fbbf24] object-cover"
              />
              <img
                src={assets.castePortraits.Savant}
                alt=""
                className="w-8 h-8 border-2 border-[#fbbf24] object-cover"
              />
              <img
                src={assets.castePortraits.Matriarch}
                alt=""
                className="w-8 h-8 border-2 border-[#fbbf24] object-cover"
              />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#fde68a]">
                36 Loyal Rat Subjects Ready to Serve the Crown!
              </div>
              <div className="text-[10px] text-[#bfa07a]">
                Gatherers • Tunnel Miners • Clan Elders • Caretakers • Gate Guards
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN KINGDOM VIEWPORT (100% 2D GAME SPRITE UI & DIEGETIC COPY)
  // ---------------------------------------------------------------------------
  return (
    <div className="relative w-screen h-dvh overflow-hidden bg-[#120b07] text-[#fef3c7] flex flex-col select-none">
      {/* TOP ROYAL BANNER: CHAPTER + CROWN GOAL + RESOURCES + ELDER QUEST */}
      <header
        className="relative z-30 bg-[#1c110a] border-b-2 border-[#85582a] px-2.5 py-2 sm:px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(24, 14, 8, 0.92), rgba(24, 14, 8, 0.95)), url(${assets.uiSprites.parchmentBanner})`,
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-1.5">
          {/* Top Row: Ruler Identity + Kingdom Goal Progress + 2D Sprite Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            {/* King & Chapter Badge */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setActiveTab('goal')}
                className="relative shrink-0 cursor-pointer group"
                title="View Royal Quests & Kingdom Goal"
              >
                <img
                  src={assets.castePortraits.Ruler}
                  alt="King Barnaby"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-cover border-2 border-[#fbbf24]"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#d97706] border border-[#fef08a] px-1 text-[8px] font-mono font-bold text-[#120b07]">
                  Ch.{colony.epochIndex + 1}
                </span>
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-[11px] sm:text-sm font-bold text-[#fef3c7] truncate max-w-[145px] sm:max-w-none">
                    {colony.epochName}
                  </span>
                  <span className="hidden md:inline-block text-[10px] font-mono bg-[#2d1c10] text-[#fcd34d] px-1.5 py-0.5 border border-[#78512a]">
                    Day {colony.tick}
                  </span>
                </div>
                {/* Crown Victory Progress Bar */}
                <button
                  onClick={() => setActiveTab('goal')}
                  className="flex items-center gap-1 mt-0.5 cursor-pointer group"
                >
                  <img
                    src={assets.crestEmblem}
                    alt=""
                    className="w-3.5 h-3.5 object-cover border border-[#fbbf24]"
                  />
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#fbbf24] uppercase tracking-wider whitespace-nowrap">
                    Crown:
                  </span>
                  <div className="w-16 sm:w-28 h-2.5 bg-[#0e0805] border border-[#85582a] p-0.5">
                    <div
                      className="h-full bg-[#fbbf24] transition-all duration-300"
                      style={{ width: `${kingdomGoalProgress}%` }}
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#fde68a]">
                    {kingdomGoalProgress}%
                  </span>
                </button>
              </div>
            </div>

            {/* Right Controls: 2D Game Sprite Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowHowToPlay(true)}
                className="px-1.5 sm:px-2 py-1 bg-[#2d1c10] hover:bg-[#3d2616] border-2 border-[#a16c38] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#fde68a] pixel-button cursor-pointer flex items-center gap-1"
                title="Royal Lore Guide"
              >
                <img
                  src={assets.uiSprites.iconHelp}
                  alt=""
                  className="w-4 h-4 object-cover border border-[#fbbf24]"
                />
                <span>Lore</span>
              </button>

              <button
                data-testid="step-tick-btn"
                onClick={handleAdvanceDay}
                className="px-1.5 sm:px-2 py-1 bg-[#3b2414] hover:bg-[#4f311b] border-2 border-[#a16c38] text-[9px] sm:text-[10px] font-mono font-bold uppercase text-[#fef3c7] pixel-button cursor-pointer flex items-center gap-1"
              >
                <img
                  src={assets.uiSprites.iconSunDay}
                  alt=""
                  className="w-4 h-4 object-cover border border-[#fbbf24]"
                />
                <span>+1 Day</span>
              </button>

              <button
                data-testid="toggle-autosim-btn"
                onClick={() => setAutoSimRunning((v) => !v)}
                className={`px-1.5 sm:px-2 py-1 border-2 text-[9px] sm:text-[10px] font-mono font-bold uppercase pixel-button cursor-pointer flex items-center gap-1 ${
                  autoSimRunning
                    ? 'bg-[#14532d] border-[#4ade80] text-[#bbf7d0]'
                    : 'bg-[#2d1c10] border-[#78512a] text-[#d6bfa6]'
                }`}
              >
                <img
                  src={assets.uiSprites.iconPlayPause}
                  alt=""
                  className="w-4 h-4 object-cover border border-[#4ade80]"
                />
                <span>{autoSimRunning ? 'Active' : 'Rest'}</span>
              </button>

              <button
                data-testid="trigger-dilemma-btn"
                onClick={handleConsultCouncil}
                className="px-1.5 sm:px-2 py-1 bg-[#b45309] hover:bg-[#d97706] border-2 border-[#fde68a] text-[9px] sm:text-[10px] font-bold uppercase text-[#fffbeb] pixel-button cursor-pointer flex items-center gap-1"
              >
                <img
                  src={assets.uiSprites.iconHornEvent}
                  alt=""
                  className="w-4 h-4 object-cover border border-[#fef08a]"
                />
                <span>Council</span>
              </button>
            </div>
          </div>

          {/* Second Row: 4 Clear Kingdom Treasury Bars (Food, Shrooms, Mood, Rat Clan) */}
          <div className="grid grid-cols-4 gap-1.5">
            {/* FOOD (Cheese & Berries) */}
            <div className="flex items-center gap-1.5 bg-[#120b07] border-2 border-[#6b4628] px-2 py-1">
              <img
                src={assets.hudIcons.atp}
                alt="Food"
                className="w-6 h-6 object-cover border border-[#fbbf24] shrink-0"
              />
              <div className="min-w-0 leading-tight">
                <div className="flex items-baseline gap-1">
                  <span
                    data-testid="hud-atp"
                    className="text-xs sm:text-sm font-mono font-bold text-[#fde68a] tabular-nums"
                  >
                    {colony.atpKcal}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold ${
                      colony.netAtpPerTick >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                    }`}
                  >
                    {colony.netAtpPerTick >= 0 ? `+${colony.netAtpPerTick}` : colony.netAtpPerTick}
                  </span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#bfa07a] truncate">
                  Food
                </div>
              </div>
            </div>

            {/* SHROOMS (Building Supplies) */}
            <div className="flex items-center gap-1.5 bg-[#120b07] border-2 border-[#6b4628] px-2 py-1">
              <img
                src={assets.hudIcons.mycelium}
                alt="Shrooms"
                className="w-6 h-6 object-cover border border-[#34d399] shrink-0"
              />
              <div className="min-w-0 leading-tight">
                <div className="flex items-baseline gap-1">
                  <span
                    data-testid="hud-mycelium"
                    className="text-xs sm:text-sm font-mono font-bold text-[#6ee7b7] tabular-nums"
                  >
                    {colony.myceliumStock}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold ${
                      colony.netMyceliumPerTick >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                    }`}
                  >
                    {colony.netMyceliumPerTick >= 0
                      ? `+${colony.netMyceliumPerTick}`
                      : colony.netMyceliumPerTick}
                  </span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#bfa07a] truncate">
                  Shrooms
                </div>
              </div>
            </div>

            {/* MOOD (Colony Happiness) */}
            <div className="flex items-center gap-1.5 bg-[#120b07] border-2 border-[#6b4628] px-2 py-1">
              <img
                src={assets.hudIcons.stress}
                alt="Mood"
                className="w-6 h-6 object-cover border border-[#fb923c] shrink-0"
              />
              <div className="min-w-0 leading-tight">
                <div className="flex items-baseline gap-1">
                  <span
                    data-testid="hud-stress"
                    className={`text-xs sm:text-sm font-mono font-bold tabular-nums ${
                      happinessPercent >= 65
                        ? 'text-[#4ade80]'
                        : happinessPercent >= 40
                        ? 'text-[#fbbf24]'
                        : 'text-[#f87171]'
                    }`}
                  >
                    {happinessPercent}%
                  </span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#bfa07a] truncate">
                  Mood
                </div>
              </div>
            </div>

            {/* RATS (Population & Beds) */}
            <div className="flex items-center gap-1.5 bg-[#120b07] border-2 border-[#6b4628] px-2 py-1">
              <img
                src={assets.hudIcons.population}
                alt="Rats"
                className="w-6 h-6 object-cover border border-[#fde68a] shrink-0"
              />
              <div className="min-w-0 leading-tight">
                <div className="flex items-baseline gap-1">
                  <span
                    data-testid="hud-population"
                    className="text-xs sm:text-sm font-mono font-bold text-[#fffbeb] tabular-nums"
                  >
                    {colony.population}/{colony.maxCapacity}
                  </span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#bfa07a] truncate">
                  Rat Clan
                </div>
              </div>
            </div>
          </div>

          {/* ELDER WHISKERS' INTERACTIVE ROYAL QUEST GUIDE BANNER */}
          <div
            className="bg-[#26170d] border-2 border-[#d97706] px-2.5 py-1.5 flex items-center justify-between gap-2 pixel-panel"
            style={{
              backgroundImage: `linear-gradient(rgba(38, 23, 13, 0.9), rgba(38, 23, 13, 0.93)), url(${assets.uiSprites.parchmentBanner})`,
              backgroundSize: 'cover',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={assets.castePortraits.Savant}
                alt="Elder Whiskers"
                className="w-8 h-8 object-cover border-2 border-[#fbbf24] shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#d97706] text-[#120b07] text-[9px] font-mono font-black px-1.5 py-0.2 uppercase">
                    {allQuestsClaimed
                      ? 'ALL QUESTS COMPLETE'
                      : `QUEST ${currentQuest.stepNumber}/${ROYAL_QUESTS.length}`}
                  </span>
                  <span className="text-xs font-bold text-[#fef08a] truncate">
                    {allQuestsClaimed
                      ? 'Expand your burrow to reach 100% Crown Progress!'
                      : currentQuest.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#f3e8d2] truncate">
                  {allQuestsClaimed
                    ? 'Expand halls and care for your clan to celebrate the Golden Rat Kingdom!'
                    : currentQuest.instruction}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isCurrentQuestReadyToClaim ? (
                <button
                  data-testid="claim-quest-btn"
                  onClick={handleClaimQuest}
                  className="px-3 py-1.5 bg-[#16a34a] hover:bg-[#22c55e] border-2 border-[#bbf7d0] text-white text-[11px] font-bold uppercase tracking-wider pixel-button cursor-pointer animate-pulse flex items-center gap-1.5"
                >
                  <img
                    src={assets.hudIcons.atp}
                    alt=""
                    className="w-4 h-4 object-cover border border-white"
                  />
                  <span>Claim +{currentQuest.rewardFood} Food!</span>
                </button>
              ) : (
                <button
                  data-testid="guide-quest-btn"
                  onClick={handleGuideMeToQuest}
                  style={{
                    backgroundImage: `linear-gradient(rgba(217, 119, 6, 0.85), rgba(180, 83, 9, 0.9)), url(${assets.uiSprites.woodButtonGold})`,
                    backgroundSize: 'cover',
                  }}
                  className="px-2.5 py-1.5 border-2 border-[#fef08a] text-[#fffbeb] text-[10px] font-bold uppercase tracking-wider pixel-button cursor-pointer flex items-center gap-1"
                >
                  <img
                    src={assets.uiSprites.tabQuests}
                    alt=""
                    className="w-4 h-4 object-cover border border-[#fef08a]"
                  />
                  <span className="drop-shadow-[0_1px_1px_#000]">Show Me</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN STAGE AREA */}
      <main className="relative flex-1 overflow-hidden">
        {/* UNDERGROUND BURROW WORLD CANVAS */}
        <div className="absolute inset-0">
          <BurrowCanvas
            state={colony}
            assets={assets}
            selectedChamberId={selectedChamber?.id || null}
            selectedRatId={selectedAgent?.id || null}
            questTargetChamberId={
              !allQuestsClaimed && !isCurrentQuestReadyToClaim
                ? currentQuest.targetChamberId || null
                : null
            }
            onSelectChamber={handleSelectChamberFromCanvas}
            onSelectRat={handleSelectAgentFromCanvas}
          />
        </div>

        {/* Royal Herald Notification Banner */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-[#1e120b] border-2 border-[#fbbf24] text-[#fef3c7] px-4 py-2 text-xs font-bold tracking-wide pixel-panel flex items-center gap-2">
            <img
              src={assets.uiSprites.iconHornEvent}
              alt=""
              className="w-4 h-4 object-cover border border-[#fbbf24]"
            />
            {toastMessage}
          </div>
        )}

        {/* VIEW 1: BURROW HALLS + HALL EXPANSION SCROLL */}
        {activeTab === 'burrow' && (
          <>
            {/* Bottom Floating Selected Hall Banner when scroll is closed */}
            {!isDrawerOpen && selectedChamber && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-md">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  style={{
                    backgroundImage: `linear-gradient(rgba(30, 18, 11, 0.92), rgba(30, 18, 11, 0.95)), url(${assets.uiSprites.parchmentBanner})`,
                    backgroundSize: 'cover',
                  }}
                  className="w-full border-2 border-[#c88a36] px-3.5 py-2.5 flex items-center justify-between gap-3 pixel-panel cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <img
                      src={getChamberArtwork(selectedChamber.id)}
                      alt={selectedChamber.name}
                      className="w-10 h-10 object-cover border-2 border-[#fbbf24] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#fbbf24]">
                        Selected Hall • Lv.{selectedChamber.level}
                      </div>
                      <div className="text-sm font-display font-bold text-[#fffbeb] truncate">
                        {selectedChamber.name}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundImage: `linear-gradient(rgba(217, 119, 6, 0.85), rgba(180, 83, 9, 0.92)), url(${assets.uiSprites.woodButtonGold})`,
                      backgroundSize: 'cover',
                    }}
                    className="px-3 py-1.5 border-2 border-[#fef08a] text-[#fffbeb] text-xs font-bold uppercase shrink-0 drop-shadow-[0_1px_1px_#000]"
                  >
                    Inspect / Expand
                  </span>
                </button>
              </div>
            )}

            {/* Hall Inspector & Expansion Scroll */}
            {isDrawerOpen && selectedChamber && (
              <div className="absolute bottom-0 inset-x-0 z-30 flex justify-center p-2 sm:p-4 pointer-events-none">
                <div
                  style={{
                    backgroundImage: `linear-gradient(rgba(28, 17, 10, 0.94), rgba(28, 17, 10, 0.97)), url(${assets.uiSprites.parchmentBanner})`,
                    backgroundSize: 'cover',
                  }}
                  className="pointer-events-auto w-full max-w-lg border-2 border-[#fbbf24] p-3.5 sm:p-4 pixel-panel"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getChamberArtwork(selectedChamber.id)}
                        alt={selectedChamber.name}
                        className="w-16 h-16 object-cover border-2 border-[#fbbf24] shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-[#78350f] border border-[#fbbf24] text-[10px] font-mono font-bold text-[#fef08a] uppercase">
                            Level {selectedChamber.level}
                          </span>
                          <span className="text-[11px] font-mono text-[#bfa07a]">
                            +{selectedChamber.capacityBonus} Rat Beds
                          </span>
                        </div>
                        <h2 className="font-display text-lg font-bold text-[#fffbeb] mt-0.5">
                          {selectedChamber.name}
                        </h2>
                        <p className="text-xs text-[#e5cfa8] leading-snug">
                          {selectedChamber.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-2 py-1 bg-[#2d1c10] hover:bg-[#3f2817] border-2 border-[#85582a] text-xs font-bold text-[#fde68a] cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <img
                        src={assets.uiSprites.iconClose}
                        alt=""
                        className="w-4 h-4 object-cover border border-[#fbbf24]"
                      />
                      <span>Close</span>
                    </button>
                  </div>

                  {/* Hall Daily Output Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="bg-[#120b07] border border-[#5c3a1e] p-2">
                      <div className="text-[10px] uppercase text-[#bfa07a] font-bold">
                        Food / Day
                      </div>
                      <div className="text-sm font-mono font-bold text-[#fde68a]">
                        +{selectedChamber.atpProductionPerTick}
                      </div>
                    </div>
                    <div className="bg-[#120b07] border border-[#5c3a1e] p-2">
                      <div className="text-[10px] uppercase text-[#bfa07a] font-bold">
                        Shrooms / Day
                      </div>
                      <div className="text-sm font-mono font-bold text-[#6ee7b7]">
                        +{selectedChamber.myceliumProductionPerTick}
                      </div>
                    </div>
                    <div className="bg-[#120b07] border border-[#5c3a1e] p-2">
                      <div className="text-[10px] uppercase text-[#bfa07a] font-bold">
                        Mood Boost
                      </div>
                      <div className="text-sm font-mono font-bold text-[#fb923c]">
                        +{selectedChamber.stressMitigationPerTick}
                      </div>
                    </div>
                  </div>

                  {/* Expand Hall Button */}
                  <button
                    data-testid="excavate-chamber-btn"
                    onClick={() => handleUpgradeChamber(selectedChamber.id)}
                    style={{
                      backgroundImage: `linear-gradient(rgba(217, 119, 6, 0.85), rgba(180, 83, 9, 0.92)), url(${assets.uiSprites.woodButtonGold})`,
                      backgroundSize: 'cover',
                    }}
                    className="w-full py-2.5 px-4 border-2 border-[#fef08a] text-[#fffbeb] font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between pixel-button cursor-pointer"
                  >
                    <span className="drop-shadow-[0_1px_2px_#000]">
                      Expand Hall to Lv.{selectedChamber.level + 1}
                    </span>
                    <span className="font-mono text-xs bg-[#120b07] text-[#fef08a] px-2 py-0.5 border border-[#fbbf24]">
                      Cost: {selectedChamber.excavationCostAtp} Food •{' '}
                      {selectedChamber.excavationCostMycelium} Shrooms
                    </span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: CLAN SUBJECTS ROSTER */}
        {activeTab === 'clan' && (
          <div className="absolute inset-0 z-20 bg-[#120b07]/95 overflow-y-auto p-3 sm:p-5">
            <div className="max-w-4xl mx-auto space-y-4 pb-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#6b4628] pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={assets.uiSprites.tabClan}
                    alt=""
                    className="w-9 h-9 object-cover border-2 border-[#fbbf24]"
                  />
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#fef3c7]">
                      Royal Clan Subjects ({colony.agents.length} Notable Rats)
                    </h2>
                    <p className="text-xs text-[#d6bfa6]">
                      Select any subject to inspect their calling, current hall, and mood!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('burrow')}
                  className="px-3 py-1.5 bg-[#2d1c10] border-2 border-[#a16c38] text-xs font-bold text-[#fde68a] pixel-button cursor-pointer flex items-center gap-1.5"
                >
                  <img
                    src={assets.uiSprites.tabBurrow}
                    alt=""
                    className="w-4 h-4 object-cover border border-[#fbbf24]"
                  />
                  <span>Return to Burrow</span>
                </button>
              </div>

              {/* Selected Subject Spotlight Card */}
              {selectedAgent && (
                <div
                  style={{
                    backgroundImage: `linear-gradient(rgba(30, 18, 11, 0.92), rgba(30, 18, 11, 0.95)), url(${assets.uiSprites.parchmentBanner})`,
                    backgroundSize: 'cover',
                  }}
                  className="border-2 border-[#fbbf24] p-4 pixel-panel"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={getCastePortrait(selectedAgent.caste)}
                        alt={selectedAgent.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-[#fbbf24] shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                              FRIENDLY_JOB_NAMES[selectedAgent.caste].badgeColor
                            }`}
                          >
                            {FRIENDLY_JOB_NAMES[selectedAgent.caste].title}
                          </span>
                          <span className="text-xs font-mono text-[#bfa07a]">
                            Age: {Math.max(1, Math.round(selectedAgent.ageDays / 30))} months
                          </span>
                        </div>
                        <h3 className="font-display text-xl font-bold text-[#fffbeb] mt-1">
                          {selectedAgent.name}
                        </h3>
                        <p className="text-xs text-[#fde68a] mt-0.5">
                          Current Duty: {selectedAgent.activity}
                        </p>
                        <p className="text-[11px] text-[#bfa07a] mt-0.5">
                          {FRIENDLY_JOB_NAMES[selectedAgent.caste].roleDesc}
                        </p>
                      </div>
                    </div>

                    {/* Friendly Subject Stats */}
                    <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                      <div className="bg-[#120b07] border border-[#5c3a1e] px-3 py-2 text-center">
                        <div className="text-[10px] uppercase text-[#bfa07a]">Happiness</div>
                        <div className="text-sm font-mono font-bold text-[#4ade80]">
                          {Math.max(15, 100 - selectedAgent.corticosteroneStress)}%
                        </div>
                      </div>
                      <div className="bg-[#120b07] border border-[#5c3a1e] px-3 py-2 text-center">
                        <div className="text-[10px] uppercase text-[#bfa07a]">Vitality</div>
                        <div className="text-sm font-mono font-bold text-[#fde68a]">
                          {Math.min(100, Math.round(selectedAgent.bloodGlucoseMgDl * 0.75))}%
                        </div>
                      </div>
                      <div className="bg-[#120b07] border border-[#5c3a1e] px-3 py-2 text-center">
                        <div className="text-[10px] uppercase text-[#bfa07a]">Loyalty</div>
                        <div className="text-sm font-mono font-bold text-[#38bdf8]">
                          {Math.round(selectedAgent.genome.mhcKinAltruism * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of All 24 Named Clan Subjects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {colony.agents.map((agent) => {
                  const isSelected = agent.id === selectedAgent?.id;
                  const jobInfo = FRIENDLY_JOB_NAMES[agent.caste];
                  const roomName =
                    colony.chambers.find((c) => c.id === agent.chamberId)?.name || 'Root Tunnels';
                  return (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgentId(agent.id);
                        setHasInspectedRat(true);
                      }}
                      className={`text-left p-3 border-2 transition flex items-center gap-3 cursor-pointer pixel-panel ${
                        isSelected
                          ? 'bg-[#2d1c10] border-[#fbbf24]'
                          : 'bg-[#1a100a] border-[#5c3a1e] hover:border-[#a16c38]'
                      }`}
                    >
                      <img
                        src={getCastePortrait(agent.caste)}
                        alt={agent.name}
                        className="w-12 h-12 object-cover border-2 border-[#c88a36] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-display font-bold text-sm text-[#fffbeb] truncate">
                            {agent.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border ${jobInfo.badgeColor}`}
                          >
                            {jobInfo.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#e5cfa8] truncate mt-0.5">
                          {agent.activity}
                        </div>
                        <div className="text-[10px] font-mono text-[#bfa07a] mt-0.5 truncate">
                          Hall: {roomName}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ROYAL LAWS (DECREES) */}
        {activeTab === 'decrees' && (
          <div className="absolute inset-0 z-20 bg-[#120b07]/95 overflow-y-auto p-3 sm:p-5">
            <div className="max-w-3xl mx-auto space-y-4 pb-8">
              <div className="flex items-center justify-between border-b-2 border-[#6b4628] pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={assets.uiSprites.tabLaws}
                    alt=""
                    className="w-9 h-9 object-cover border-2 border-[#fbbf24]"
                  />
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#fef3c7]">
                      Royal Laws of the Burrow
                    </h2>
                    <p className="text-xs text-[#d6bfa6]">
                      Enact royal laws to guide how your clan gathers food, shares harvests, and cares for one another.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('burrow')}
                  className="px-3 py-1.5 bg-[#2d1c10] border-2 border-[#a16c38] text-xs font-bold text-[#fde68a] pixel-button cursor-pointer flex items-center gap-1.5"
                >
                  <img
                    src={assets.uiSprites.tabBurrow}
                    alt=""
                    className="w-4 h-4 object-cover border border-[#fbbf24]"
                  />
                  <span>Return to Burrow</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {colony.decrees.map((decree) => (
                  <div
                    key={decree.id}
                    style={{
                      backgroundImage: `linear-gradient(rgba(26, 16, 10, 0.92), rgba(26, 16, 10, 0.95)), url(${assets.uiSprites.parchmentBanner})`,
                      backgroundSize: 'cover',
                    }}
                    className={`p-4 border-2 pixel-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      decree.active ? 'border-[#fbbf24]' : 'border-[#5c3a1e]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                            decree.active
                              ? 'bg-[#14532d] border-[#4ade80] text-[#bbf7d0]'
                              : 'bg-[#2d1c10] border-[#78512a] text-[#bfa07a]'
                          }`}
                        >
                          {decree.active ? 'ROYAL LAW IN FORCE' : 'UNSEALED SCROLL'}
                        </span>
                        <h3 className="font-display text-base font-bold text-[#fffbeb]">
                          {decree.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[#e5cfa8]">{decree.description}</p>
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono">
                        {decree.effects.atpMultiplier !== 1 && (
                          <span className="bg-[#120b07] border border-[#5c3a1e] px-2 py-0.5 text-[#fde68a]">
                            Food Harvest: {Math.round(decree.effects.atpMultiplier * 100)}%
                          </span>
                        )}
                        {decree.effects.stressDeltaPerTick !== 0 && (
                          <span className="bg-[#120b07] border border-[#5c3a1e] px-2 py-0.5 text-[#4ade80]">
                            Mood Effect:{' '}
                            {decree.effects.stressDeltaPerTick < 0
                              ? `+${Math.abs(decree.effects.stressDeltaPerTick)} Happier`
                              : `-${decree.effects.stressDeltaPerTick} Tired`}
                          </span>
                        )}
                        {decree.effects.eqDeltaPerTick > 0 && (
                          <span className="bg-[#120b07] border border-[#5c3a1e] px-2 py-0.5 text-[#38bdf8]">
                            Wisdom: +{decree.effects.eqDeltaPerTick}/day
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleDecree(decree.id)}
                      style={{
                        backgroundImage: decree.active
                          ? undefined
                          : `linear-gradient(rgba(217, 119, 6, 0.85), rgba(180, 83, 9, 0.92)), url(${assets.uiSprites.woodButtonGold})`,
                        backgroundSize: 'cover',
                      }}
                      className={`px-4 py-2.5 border-2 font-display font-bold text-xs uppercase tracking-wider shrink-0 pixel-button cursor-pointer ${
                        decree.active
                          ? 'bg-[#7f1d1d] hover:bg-[#991b1b] border-[#fca5a5] text-white'
                          : 'border-[#fef08a] text-[#fffbeb]'
                      }`}
                    >
                      {decree.active
                        ? 'Repeal Law'
                        : `Pass Law (${decree.costAtp} Food, ${decree.costMycelium} Shrooms)`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: ROYAL DESTINY, QUEST SCROLL & KINGDOM CHRONICLE */}
        {activeTab === 'goal' && (
          <div className="absolute inset-0 z-20 bg-[#120b07]/95 overflow-y-auto p-3 sm:p-5">
            <div className="max-w-4xl mx-auto space-y-4 pb-8">
              <div className="flex items-center justify-between border-b-2 border-[#6b4628] pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={assets.uiSprites.tabQuests}
                    alt=""
                    className="w-9 h-9 object-cover border-2 border-[#fbbf24]"
                  />
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#fef3c7]">
                      Royal Destiny &amp; Elder Whiskers&apos; Quests
                    </h2>
                    <p className="text-xs text-[#d6bfa6]">
                      Fulfill royal quests, expand your halls, and grow your clan to crown the Golden Rat Kingdom!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('burrow')}
                  className="px-3 py-1.5 bg-[#2d1c10] border-2 border-[#a16c38] text-xs font-bold text-[#fde68a] pixel-button cursor-pointer flex items-center gap-1.5"
                >
                  <img
                    src={assets.uiSprites.tabBurrow}
                    alt=""
                    className="w-4 h-4 object-cover border border-[#fbbf24]"
                  />
                  <span>Return to Burrow</span>
                </button>
              </div>

              {/* Royal Destiny Card */}
              <div
                style={{
                  backgroundImage: `linear-gradient(rgba(30, 18, 11, 0.92), rgba(30, 18, 11, 0.96)), url(${assets.uiSprites.parchmentBanner})`,
                  backgroundSize: 'cover',
                }}
                className="border-2 border-[#fbbf24] p-4 pixel-panel"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={assets.crestEmblem}
                      alt="Crown"
                      className="w-12 h-12 object-cover border-2 border-[#fbbf24]"
                    />
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#fbbf24]">
                        Royal Destiny of the Oak Clan
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#fffbeb]">
                        Build the Golden Rat Kingdom ({kingdomGoalProgress}% Complete)
                      </h3>
                      <p className="text-xs text-[#e5cfa8]">
                        Grow your clan to 60 Rats, fulfill Elder Whiskers&apos; 5 Royal Quests, and expand your burrow halls!
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs text-[#fde68a]">Clan Wisdom: {wisdomScore}</div>
                    <div className="text-xs text-[#6ee7b7]">
                      Clan Unity: {Math.round(colony.eusocialityIndex)}%
                    </div>
                  </div>
                </div>

                <div className="w-full h-4 bg-[#0e0805] border-2 border-[#85582a] p-0.5 mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-[#d97706] to-[#facc15] transition-all duration-300"
                    style={{ width: `${kingdomGoalProgress}%` }}
                  />
                </div>

                {/* 5 Kingdom Chapters Roadmap */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {EVOLUTIONARY_EPOCHS.map((ep) => {
                    const reached = colony.epochIndex >= ep.index;
                    return (
                      <div
                        key={ep.index}
                        className={`p-2.5 border-2 ${
                          reached
                            ? 'bg-[#2b1b0e] border-[#fbbf24] text-[#fef3c7]'
                            : 'bg-[#140c07] border-[#4a3019] text-[#8c7355]'
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[#fbbf24]">
                          <img
                            src={assets.crestEmblem}
                            alt=""
                            className="w-3.5 h-3.5 object-cover border border-[#fbbf24]"
                          />
                          <span>{reached ? 'CROWNED ERA' : 'LOCKED ERA'}</span>
                        </div>
                        <div className="font-display text-xs font-bold mt-1">{ep.name}</div>
                        <div className="text-[10px] mt-1 leading-snug opacity-90">
                          {ep.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step-by-Step Quest Scroll */}
              <div className="bg-[#1a100a] border-2 border-[#78512a] p-4 pixel-panel space-y-2.5">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#fbbf24]">
                  Elder Whiskers&apos; Royal Quest Scroll
                </h3>
                {ROYAL_QUESTS.map((q) => {
                  const claimed = claimedQuestIds.includes(q.id);
                  const ready = !claimed && q.isComplete(colony, hasInspectedRat);
                  return (
                    <div
                      key={q.id}
                      className={`p-3 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        claimed
                          ? 'bg-[#132a1c]/60 border-[#4ade80]/60'
                          : ready
                          ? 'bg-[#2b1b0e] border-[#fbbf24]'
                          : 'bg-[#120b07] border-[#4a3019]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#2d1c10] border border-[#85582a] text-[#fde68a]">
                            Quest {q.stepNumber}
                          </span>
                          <span className="font-display font-bold text-sm text-[#fffbeb]">
                            {q.title}
                          </span>
                          {claimed && (
                            <span className="text-[10px] font-mono font-bold text-[#4ade80] flex items-center gap-1">
                              <img
                                src={assets.crestEmblem}
                                alt=""
                                className="w-3.5 h-3.5 object-cover border border-[#4ade80]"
                              />
                              <span>FULFILLED</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#e5cfa8] mt-1">{q.instruction}</p>
                        <p className="text-[10px] font-mono text-[#fbbf24] mt-0.5">
                          Royal Reward: +{q.rewardFood} Food &amp; +{q.rewardShrooms} Shrooms
                        </p>
                      </div>

                      {!claimed && (
                        <div>
                          {ready ? (
                            <button
                              onClick={handleClaimQuest}
                              className="px-3 py-1.5 bg-[#16a34a] border-2 border-[#bbf7d0] text-white text-xs font-bold uppercase pixel-button cursor-pointer"
                            >
                              Claim Reward
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (q.targetChamberId) {
                                  setSelectedChamberId(q.targetChamberId);
                                  setActiveTab('burrow');
                                  setIsDrawerOpen(true);
                                } else if (q.targetTab) {
                                  if (q.id === 'quest_inspect_rat') setHasInspectedRat(true);
                                  setActiveTab(q.targetTab);
                                }
                              }}
                              className="px-3 py-1.5 bg-[#d97706] border-2 border-[#fef08a] text-[#120b07] text-xs font-bold uppercase pixel-button cursor-pointer"
                            >
                              Lead Me There
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Recent Kingdom Story Log */}
              <div className="bg-[#1a100a] border-2 border-[#6b4628] p-4 pixel-panel space-y-2">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#fde68a]">
                  Kingdom Chronicle
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {colony.logs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#120b07] border border-[#4a3019] p-2.5 flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#fef3c7]">{log.title}</div>
                        <div className="text-[11px] text-[#bfa07a] mt-0.5">{log.detail}</div>
                      </div>
                      <span className="text-[10px] font-mono bg-[#2d1c10] border border-[#78512a] px-1.5 py-0.5 text-[#fcd34d] shrink-0">
                        {log.metricBadge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROYAL COUNCIL EVENT POPUP SCROLL */}
        {colony.activeDilemma && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div
              style={{
                backgroundImage: `linear-gradient(rgba(28, 17, 10, 0.94), rgba(28, 17, 10, 0.97)), url(${assets.uiSprites.parchmentBanner})`,
                backgroundSize: 'cover',
              }}
              className="w-full max-w-lg border-4 border-[#fbbf24] p-4 sm:p-5 pixel-panel space-y-4"
            >
              <div className="flex items-center gap-3 border-b-2 border-[#6b4628] pb-3">
                <img
                  src={assets.castePortraits.Savant}
                  alt="Council"
                  className="w-12 h-12 object-cover border-2 border-[#fbbf24]"
                />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#fbbf24]">
                    {colony.activeDilemma.source}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#fffbeb]">
                    {colony.activeDilemma.dilemmaTitle}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#f3e8d2] leading-relaxed">
                {colony.activeDilemma.dilemmaContext}
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  data-testid="dilemma-option-a"
                  onClick={() => handleResolveDilemma('A')}
                  className="text-left p-3 bg-[#2b1b0e] hover:bg-[#3b2513] border-2 border-[#fbbf24] pixel-button cursor-pointer"
                >
                  <div className="font-display font-bold text-sm text-[#fef08a]">
                    Royal Choice I: {colony.activeDilemma.optionA.label}
                  </div>
                  <div className="text-xs text-[#e5cfa8] mt-0.5">
                    {colony.activeDilemma.optionA.scientificRationale}
                  </div>
                </button>

                <button
                  data-testid="dilemma-option-b"
                  onClick={() => handleResolveDilemma('B')}
                  className="text-left p-3 bg-[#1e120b] hover:bg-[#2d1c10] border-2 border-[#a16c38] pixel-button cursor-pointer"
                >
                  <div className="font-display font-bold text-sm text-[#fffbeb]">
                    Royal Choice II: {colony.activeDilemma.optionB.label}
                  </div>
                  <div className="text-xs text-[#d6bfa6] mt-0.5">
                    {colony.activeDilemma.optionB.scientificRationale}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ROYAL LORE TOME (HOW TO RULE) */}
        {showHowToPlay && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div
              style={{
                backgroundImage: `linear-gradient(rgba(28, 17, 10, 0.94), rgba(28, 17, 10, 0.97)), url(${assets.uiSprites.parchmentBanner})`,
                backgroundSize: 'cover',
              }}
              className="w-full max-w-md border-4 border-[#fbbf24] p-4 sm:p-5 pixel-panel space-y-3"
            >
              <div className="flex items-center justify-between border-b-2 border-[#6b4628] pb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={assets.uiSprites.iconHelp}
                    alt="Lore Book"
                    className="w-9 h-9 object-cover border-2 border-[#fbbf24]"
                  />
                  <h3 className="font-display text-base font-bold text-[#fffbeb]">
                    Royal Lore: How to Rule
                  </h3>
                </div>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="px-2 py-1 bg-[#2d1c10] border border-[#85582a] text-xs font-bold text-[#fde68a] cursor-pointer flex items-center gap-1"
                >
                  <img
                    src={assets.uiSprites.iconClose}
                    alt="Close"
                    className="w-4 h-4 object-cover"
                  />
                  <span>Close</span>
                </button>
              </div>

              <div className="space-y-2 text-xs text-[#f3e8d2]">
                <div className="bg-[#120b07] border border-[#5c3a1e] p-2.5">
                  <div className="font-bold text-[#fbbf24]">1. Your Royal Destiny</div>
                  <p className="mt-0.5 text-[#d6bfa6]">
                    Fill the <strong>Crown Progress</strong> bar to 100% by fulfilling Elder Whiskers&apos; quests, expanding burrow halls, and growing your clan to 60 happy rats!
                  </p>
                </div>
                <div className="bg-[#120b07] border border-[#5c3a1e] p-2.5">
                  <div className="font-bold text-[#4ade80]">2. Food &amp; Shrooms</div>
                  <p className="mt-0.5 text-[#d6bfa6]">
                    <strong>Food</strong> feeds your clan every day. <strong>Shrooms</strong> are building supplies used along with Food to expand halls and pass Royal Laws.
                  </p>
                </div>
                <div className="bg-[#120b07] border border-[#5c3a1e] p-2.5">
                  <div className="font-bold text-[#38bdf8]">3. Explore the Burrow</div>
                  <p className="mt-0.5 text-[#d6bfa6]">
                    Drag anywhere in the burrow to look around, tap any hall to expand it, or tap any scurrying rat subject to see their name and calling!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHowToPlay(false)}
                style={{
                  backgroundImage: `linear-gradient(rgba(217, 119, 6, 0.85), rgba(180, 83, 9, 0.92)), url(${assets.uiSprites.woodButtonGold})`,
                  backgroundSize: 'cover',
                }}
                className="w-full py-2.5 border-2 border-[#fef08a] text-[#fffbeb] font-display font-black text-xs uppercase tracking-wider pixel-button cursor-pointer"
              >
                Return to the Throne
              </button>
            </div>
          </div>
        )}

        {/* VICTORY / DEFEAT ROYAL PROCLAMATION */}
        {colony.status !== 'playing' && (
          <div className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1c110a] border-4 border-[#fbbf24] p-5 text-center pixel-panel space-y-4">
              <img
                src={assets.crestEmblem}
                alt="Crown"
                className="w-16 h-16 mx-auto object-cover border-2 border-[#fbbf24]"
              />
              <h2 className="font-display text-2xl font-black text-[#fef08a]">
                {colony.status === 'victory'
                  ? 'THE GOLDEN RAT KINGDOM!'
                  : 'THE CLAN HAS SCATTERED'}
              </h2>
              <p className="text-xs sm:text-sm text-[#e5cfa8] leading-relaxed">
                {colony.outcomeReason}
              </p>
              <button
                onClick={handleResetGame}
                className="w-full py-3 bg-[#d97706] border-2 border-[#fef08a] text-[#120b07] font-display font-black text-sm uppercase tracking-wider pixel-button cursor-pointer"
              >
                Found a New Rat Kingdom
              </button>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM 2D SPRITE NAVIGATION DOCK (THUMB-ZONE OPTIMIZED >= 48px) */}
      <nav
        className="relative z-30 bg-[#1a100a] border-t-2 border-[#85582a] px-2 py-1.5"
        style={{
          backgroundImage: `linear-gradient(rgba(22, 13, 8, 0.94), rgba(22, 13, 8, 0.97)), url(${assets.uiSprites.parchmentBanner})`,
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1.5">
          <button
            data-testid="nav-burrow"
            onClick={() => setActiveTab('burrow')}
            style={{
              backgroundImage:
                activeTab === 'burrow'
                  ? `linear-gradient(rgba(217, 119, 6, 0.85), rgba(180, 83, 9, 0.92)), url(${assets.uiSprites.woodButtonGold})`
                  : undefined,
              backgroundSize: 'cover',
            }}
            className={`py-1.5 px-2 border-2 flex items-center justify-center gap-2 cursor-pointer min-h-[48px] ${
              activeTab === 'burrow'
                ? 'border-[#fef08a] text-[#fffbeb] font-black'
                : 'bg-[#26170d] border-[#5c3a1e] text-[#fde68a] font-bold'
            }`}
          >
            <img
              src={assets.uiSprites.tabBurrow}
              alt=""
              className="w-7 h-7 object-cover border border-[#fbbf24] shrink-0"
            />
            <div className="text-left leading-tight">
              <div className="text-[11px] uppercase tracking-wider">Burrow</div>
              <div className="text-[9px] font-mono opacity-85">
                {colony.chambers.length} Halls
              </div>
            </div>
          </button>

          <button
            data-testid="nav-clan"
            onClick={() => {
              setActiveTab('clan');
              setHasInspectedRat(true);
            }}
            style={{
              backgroundImage:
                activeTab === 'clan'
                  ? `linear-gradient(rgba(217, 119, 6, 0.85), rgba(180, 83, 9, 0.92)), url(${assets.uiSprites.woodButtonGold})`
                  : undefined,
              backgroundSize: 'cover',
            }}
            className={`py-1.5 px-2 border-2 flex items-center justify-center gap-2 cursor-pointer min-h-[48px] ${
              activeTab === 'clan'
                ? 'border-[#fef08a] text-[#fffbeb] font-black'
                : 'bg-[#26170d] border-[#5c3a1e] text-[#fde68a] font-bold'
            }`}
          >
            <img
              src={assets.uiSprites.tabClan}
              alt=""
              className="w-7 h-7 object-cover border border-[#fbbf24] shrink-0"
            />
            <div className="text-left leading-tight">
              <div className="text-[11px] uppercase tracking-wider">Clan</div>
              <div className="text-[9px] font-mono opacity-85">
                {colony.population} Rats
              </div>
            </div>
          </button>

          <button
            data-testid="nav-decrees"
            onClick={() => setActiveTab('decrees')}
            style={{
              backgroundImage:
                activeTab === 'decrees'
                  ? `linear-gradient(rgba(217, 119, 6, 0.85), rgba(180, 83, 9, 0.92)), url(${assets.uiSprites.woodButtonGold})`
                  : undefined,
              backgroundSize: 'cover',
            }}
            className={`py-1.5 px-2 border-2 flex items-center justify-center gap-2 cursor-pointer min-h-[48px] ${
              activeTab === 'decrees'
                ? 'border-[#fef08a] text-[#fffbeb] font-black'
                : 'bg-[#26170d] border-[#5c3a1e] text-[#fde68a] font-bold'
            }`}
          >
            <img
              src={assets.uiSprites.tabLaws}
              alt=""
              className="w-7 h-7 object-cover border border-[#fbbf24] shrink-0"
            />
            <div className="text-left leading-tight">
              <div className="text-[11px] uppercase tracking-wider">Laws</div>
              <div className="text-[9px] font-mono opacity-85">
                {colony.decrees.filter((d) => d.active).length} Active
              </div>
            </div>
          </button>

          <button
            data-testid="nav-goal"
            onClick={() => setActiveTab('goal')}
            style={{
              backgroundImage:
                activeTab === 'goal'
                  ? `linear-gradient(rgba(217, 119, 6, 0.85), rgba(180, 83, 9, 0.92)), url(${assets.uiSprites.woodButtonGold})`
                  : undefined,
              backgroundSize: 'cover',
            }}
            className={`py-1.5 px-2 border-2 flex items-center justify-center gap-2 cursor-pointer relative min-h-[48px] ${
              activeTab === 'goal'
                ? 'border-[#fef08a] text-[#fffbeb] font-black'
                : 'bg-[#26170d] border-[#5c3a1e] text-[#fde68a] font-bold'
            }`}
          >
            <img
              src={assets.uiSprites.tabQuests}
              alt=""
              className="w-7 h-7 object-cover border border-[#fbbf24] shrink-0"
            />
            <div className="text-left leading-tight">
              <div className="text-[11px] uppercase tracking-wider">Quests</div>
              <div className="text-[9px] font-mono opacity-85">
                {kingdomGoalProgress}% Crown
              </div>
            </div>
            {isCurrentQuestReadyToClaim && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#22c55e] border border-white animate-bounce" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
