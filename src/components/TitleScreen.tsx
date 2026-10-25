import React from 'react';
import { DYNASTY_GENOTYPES, DynastyGenotypePreset } from '../game/simulationEngine';
import { GameAssetPack } from '../game/assetGenerator';

interface TitleScreenProps {
  assets: GameAssetPack;
  selectedGenotype: string;
  onSelectGenotype: (id: string) => void;
  onStartGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  assets,
  selectedGenotype,
  onSelectGenotype,
  onStartGame,
}) => {
  return (
    <main className="relative w-screen h-screen overflow-y-auto lg:overflow-hidden bg-[#090604] text-[#f4ead5] flex flex-col justify-between">
      {/* Full-Bleed Illustrated Key-Art Backdrop */}
      <div className="fixed inset-0 pointer-events-none">
        <img
          src={assets.titleBackdrop}
          alt="Subterranean Rodent Kingdom Key Art"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090604]/95 via-[#090604]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090604] via-transparent to-[#090604]/50" />
      </div>

      {/* Main Content Split over Left Negative Space */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 pt-6 pb-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Royal Emblem & Title Lockup */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-5">
          <div className="flex items-center gap-4">
            <img
              src={assets.crestEmblem}
              alt="Royal Crest of the Warren"
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-amber-500/40 shadow-lg"
            />
            <div className="text-xs sm:text-sm text-amber-300/90 tracking-wide">
              <span>Subterranean Ethology & Sociobiology Simulator</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>Kleiber & Hamilton Engine</span>
            </div>
          </div>

          <h1
            style={{ textWrap: 'balance' }}
            className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-amber-100 leading-[1.08]"
          >
            THE RAT RULER
          </h1>

          <p className="text-sm sm:text-base text-[#d9c8b0] max-w-xl leading-relaxed">
            Govern a living subterranean civilization of <em>Rattus norvegicus</em>. Guide their evolution from feral burrow aggregates into an enlightened eusocial super-organism through real metabolic scaling, epigenetic grooming, and 50-kHz ultrasonic syntax.
          </p>

          {/* Lineage Genotype Selector */}
          <div className="w-full max-w-2xl space-y-2.5 pt-1">
            <div className="text-xs font-semibold text-amber-200/80">
              Select Founding Genomic Lineage
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DYNASTY_GENOTYPES.map((preset: DynastyGenotypePreset) => {
                const isSelected = preset.id === selectedGenotype;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectGenotype(preset.id)}
                    className={`min-h-[48px] text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/75 border-amber-400 text-amber-50 shadow-md'
                        : 'bg-[#17100b]/80 border-amber-900/40 text-[#c9b79c] hover:border-amber-700/60'
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm text-amber-100">
                      {preset.name}
                    </div>
                    <div className="text-[11px] italic text-amber-400/80 truncate">
                      {preset.latinSubtitle}
                    </div>
                    <div className="text-[11px] text-[#bda98e] mt-1.5">
                      {preset.startingTraitBonus}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Start Action */}
          <div className="pt-2 flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              data-start="true"
              onClick={onStartGame}
              className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-[#140c06] font-bold text-base tracking-wide shadow-lg transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Enter the Warren
            </button>
          </div>
        </div>

        {/* Right Column: Royal Sovereign Preview Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="p-5 rounded-2xl bg-[#160f0a]/90 border border-amber-800/40 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={assets.castePortraits.Ruler}
                alt="Sovereign Archon Portrait"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-xl border border-amber-500/40 object-cover shrink-0"
              />
              <div>
                <h2 className="font-display text-lg font-bold text-amber-100">
                  Biocomputer Reality Engine
                </h2>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Multi-Agent Ethology · Epigenetic Inheritance
                </p>
                <p className="text-xs text-[#c7b499] mt-1.5">
                  Every rodent possesses a live 5-locus genome (FOXP2, NR3C1, BDNF, Myostatin, MHC) governing foraging, excavation, and vocalization.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-900/30 text-center">
              <div className="p-2 rounded-lg bg-[#0e0906]">
                <div className="text-[11px] text-[#a89479]">Metabolism</div>
                <div className="font-mono text-xs font-semibold text-amber-300 mt-0.5 tabular-nums">
                  M^(3/4) Kleiber
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#0e0906]">
                <div className="text-[11px] text-[#a89479]">Kin Selection</div>
                <div className="font-mono text-xs font-semibold text-teal-300 mt-0.5 tabular-nums">
                  rB &gt; C Hamilton
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#0e0906]">
                <div className="text-[11px] text-[#a89479]">Bio-Acoustics</div>
                <div className="font-mono text-xs font-semibold text-sky-300 mt-0.5 tabular-nums">
                  22 / 50 kHz
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flat Borderless Control Hint in Bottom Safe Margin */}
      <div className="relative z-10 w-full px-6 py-3 text-center text-xs text-[#9c886e]">
        Tap Chambers to Excavate · Tap Roaming Rodents to Inspect Genome · Space Advance Tick · P Pause Simulation
      </div>
    </main>
  );
};
