/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 16-Bit 2D Pixel Art Underground Kingdom World Canvas
 * Renders a crisp nearest-neighbor pixel art subterranean cross-section with
 * 7 pixel art rooms, wooden root ladders, quest highlights, and 24 animated
 * 2D pixel art rat villagers.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  BurrowChamber,
  CasteRole,
  ChamberType,
  ColonyState,
  RatAgent,
} from '../game/simulationEngine';
import { GameAssetPack } from '../game/assetGenerator';
import {
  loadSogniSpriteBank,
  pixelateImageToCanvas,
  selectSpriteAnimForAgent,
  SpriteAnimationBank,
} from '../game/spriteSheetEngine';

interface BurrowCanvasProps {
  state: ColonyState;
  assets: GameAssetPack;
  selectedChamberId: string | null;
  selectedRatId: string | null;
  questTargetChamberId?: string | null;
  onSelectChamber: (chamberId: string) => void;
  onSelectRat: (ratId: string) => void;
}

interface CutawayRoomLayout {
  id: string;
  row: number;
  col: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
  floorY: number;
}

const VIRTUAL_WORLD_W = 1240;
const VIRTUAL_WORLD_H = 840;
const MOBILE_WORLD_W = 620;
const MOBILE_WORLD_H = 1040;

const CHAMBER_SLOT_LAYOUT: Record<
  string,
  { row: number; col: number; cx: number; cy: number; width: number; height: number }
> = {
  chamber_throne: { row: 0, col: 1, cx: 620, cy: 195, width: 340, height: 124 },
  chamber_granary: { row: 1, col: 0, cx: 255, cy: 360, width: 320, height: 124 },
  chamber_nursery: { row: 1, col: 2, cx: 985, cy: 360, width: 320, height: 124 },
  chamber_sensorium: { row: 1, col: 1, cx: 620, cy: 360, width: 320, height: 124 },
  chamber_hydro: { row: 2, col: 0, cx: 255, cy: 525, width: 320, height: 124 },
  chamber_bastion: { row: 2, col: 2, cx: 985, cy: 525, width: 320, height: 124 },
  chamber_excavation: { row: 3, col: 1, cx: 620, cy: 690, width: 360, height: 126 },
};

const CHAMBER_SLOT_LAYOUT_MOBILE: Record<
  string,
  { row: number; col: number; cx: number; cy: number; width: number; height: number }
> = {
  chamber_throne: { row: 0, col: 1, cx: 310, cy: 175, width: 520, height: 118 },
  chamber_granary: { row: 1, col: 0, cx: 165, cy: 325, width: 268, height: 116 },
  chamber_nursery: { row: 1, col: 2, cx: 455, cy: 325, width: 268, height: 116 },
  chamber_sensorium: { row: 2, col: 1, cx: 310, cy: 475, width: 520, height: 118 },
  chamber_hydro: { row: 3, col: 0, cx: 165, cy: 625, width: 268, height: 116 },
  chamber_bastion: { row: 3, col: 2, cx: 455, cy: 625, width: 268, height: 116 },
  chamber_excavation: { row: 4, col: 1, cx: 310, cy: 775, width: 520, height: 120 },
};

const CASTE_ACCENT_HEX: Record<CasteRole, string> = {
  Ruler: '#f59e0b',
  Forager: '#22c55e',
  Engineer: '#fb923c',
  Savant: '#38bdf8',
  Matriarch: '#f472b6',
  Vanguard: '#ef4444',
};

const CHAMBER_ACCENT_HEX: Record<ChamberType, string> = {
  RoyalThrone: '#f59e0b',
  MyceliumGranary: '#22c55e',
  BioluminescentNursery: '#f472b6',
  AcousticSensorium: '#38bdf8',
  DeepExcavationShaft: '#fb923c',
  HydroConduit: '#2dd4bf',
  FermentationVault: '#a855f7',
  VanguardBastion: '#ef4444',
};

function computeRoomLayout(
  chamber: BurrowChamber,
  index: number,
  isMobilePortrait: boolean
): CutawayRoomLayout {
  const table = isMobilePortrait ? CHAMBER_SLOT_LAYOUT_MOBILE : CHAMBER_SLOT_LAYOUT;
  const preset = table[chamber.id];
  if (preset) {
    return {
      id: chamber.id,
      ...preset,
      floorY: preset.cy + preset.height * 0.5 - 12,
    };
  }
  const row = Math.min(3, Math.floor(index / 2));
  const col = index % 3;
  const cx = isMobilePortrait ? 310 : 260 + col * 360;
  const cy = 195 + row * 165;
  const width = 310;
  const height = 122;
  return {
    id: chamber.id,
    row,
    col,
    cx,
    cy,
    width,
    height,
    floorY: cy + height * 0.5 - 12,
  };
}

interface RatHitBox {
  ratId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface RoomHitBox {
  chamberId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const BurrowCanvas: React.FC<BurrowCanvasProps> = ({
  state,
  assets,
  selectedChamberId,
  selectedRatId,
  questTargetChamberId = null,
  onSelectChamber,
  onSelectRat,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<ColonyState>(state);
  stateRef.current = state;

  const selectedChamberRef = useRef<string | null>(selectedChamberId);
  selectedChamberRef.current = selectedChamberId;

  const selectedRatRef = useRef<string | null>(selectedRatId);
  selectedRatRef.current = selectedRatId;

  const questTargetRef = useRef<string | null>(questTargetChamberId);
  questTargetRef.current = questTargetChamberId;

  const spriteBankRef = useRef<SpriteAnimationBank | null>(null);
  const bgPixelCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chamberPixelCanvasesRef = useRef<Partial<Record<ChamberType, HTMLCanvasElement>>>({});
  const [spritesReady, setSpritesReady] = useState(false);

  const cameraRef = useRef({
    panX: 0,
    panY: 0,
    zoom: 1,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    panStartX: 0,
    panStartY: 0,
    pointerMovedDistance: 0,
  });

  const ratLocomotionRef = useRef<
    Map<
      string,
      {
        localOffsetX: number;
        targetOffsetX: number;
        facingRight: boolean;
        pauseTimer: number;
        animSeed: number;
      }
    >
  >(new Map());

  const ratHitBoxesRef = useRef<RatHitBox[]>([]);
  const roomHitBoxesRef = useRef<RoomHitBox[]>([]);

  // Load Sogni 2D Pixel Art spritesheets & quantize backgrounds to crisp 16-bit pixel grids
  useEffect(() => {
    let active = true;
    loadSogniSpriteBank(assets.spriteSheets)
      .then((bank) => {
        if (!active) return;
        spriteBankRef.current = bank;
        setSpritesReady(true);
      })
      .catch((err) => {
        console.error('Failed loading pixel art sprites:', err);
      });

    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = assets.cutawaySoilBg;
    bgImg.onload = () => {
      if (active) {
        bgPixelCanvasRef.current = pixelateImageToCanvas(bgImg, 320, 240);
      }
    };

    (Object.keys(assets.chamberArt) as ChamberType[]).forEach((cType) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = assets.chamberArt[cType];
      img.onload = () => {
        if (active) {
          chamberPixelCanvasesRef.current[cType] = pixelateImageToCanvas(
            img,
            136,
            64
          );
        }
      };
    });

    return () => {
      active = false;
    };
  }, [assets]);

  // Main 60 FPS 2D Pixel Art Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let frameCount = 0;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      frameCount++;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;

      if (cw <= 0 || ch <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const sim = stateRef.current;
      const cam = cameraRef.current;

      const isPortraitMobile = cw < 640;
      const worldW = isPortraitMobile ? MOBILE_WORLD_W : VIRTUAL_WORLD_W;
      const worldH = isPortraitMobile ? MOBILE_WORLD_H : VIRTUAL_WORLD_H;

      const fitScaleX = cw / worldW;
      const fitScaleY = ch / worldH;
      const baseScale = isPortraitMobile
        ? Math.min(fitScaleX * 0.96, fitScaleY * 0.88)
        : Math.min(fitScaleX * 0.98, fitScaleY * 0.92);

      const effectiveScale = baseScale * cam.zoom;
      const worldOriginX = (cw - worldW * effectiveScale) * 0.5 + cam.panX;
      const worldOriginY =
        (ch - worldH * effectiveScale) * (isPortraitMobile ? 0.42 : 0.52) +
        cam.panY;

      ctx.save();
      ctx.scale(dpr, dpr);
      // Enforce crisp nearest-neighbor 2D pixel art rendering everywhere
      ctx.imageSmoothingEnabled = false;

      // 1. Pixel Art Subterranean Earth Backdrop
      ctx.fillStyle = '#1b0f08';
      ctx.fillRect(0, 0, cw, ch);

      if (bgPixelCanvasRef.current) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(bgPixelCanvasRef.current, 0, 0, cw, ch);
        // Darken underground soil slightly so bright pixel rooms & rats pop with high contrast
        ctx.fillStyle = 'rgba(18, 10, 5, 0.48)';
        ctx.fillRect(0, 0, cw, ch);
        ctx.restore();
      }

      // Transform into Virtual Cutaway World Space
      ctx.save();
      ctx.translate(worldOriginX, worldOriginY);
      ctx.scale(effectiveScale, effectiveScale);
      ctx.imageSmoothingEnabled = false;

      // Friendly Pixel Art Depth Layer Labels
      const strataDepths = [
        { y: 108, label: 'OAK TREE ROOTS', color: '#4ade80' },
        { y: 278, label: 'UPPER BURROW HALLS', color: '#fbbf24' },
        { y: 444, label: 'GLOW-SHROOM GARDENS', color: '#38bdf8' },
        { y: 608, label: 'DEEP STONE MINES', color: '#fb923c' },
      ];

      strataDepths.forEach((s) => {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(24, s.y);
        ctx.lineTo(worldW - 24, s.y);
        ctx.stroke();

        ctx.fillStyle = s.color;
        ctx.font = '800 10px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText(s.label, 32, s.y - 6);
        ctx.restore();
      });

      const roomLayouts = new Map<string, CutawayRoomLayout>();
      sim.chambers.forEach((chamber, idx) => {
        roomLayouts.set(
          chamber.id,
          computeRoomLayout(chamber, idx, isPortraitMobile)
        );
      });

      // 2. Central Pixel-Art Wooden Ladder Shaft & Burrow Tunnels
      const shaftCenterX = worldW * 0.5;
      const shaftBottomY = isPortraitMobile ? 810 : 720;
      ctx.save();
      ctx.fillStyle = '#1f1209';
      ctx.strokeStyle = '#5c3a21';
      ctx.lineWidth = 4;
      ctx.fillRect(shaftCenterX - 24, 85, 48, shaftBottomY - 85);
      ctx.strokeRect(shaftCenterX - 24, 85, 48, shaftBottomY - 85);

      // Pixel-stepped wooden ladder rungs
      ctx.fillStyle = '#8c5830';
      for (let ry = 100; ry < shaftBottomY - 10; ry += 16) {
        ctx.fillRect(shaftCenterX - 16, ry, 32, 4);
      }
      ctx.restore();

      // Draw pixel-art timber tunnels between connected rooms
      const drawnPairs = new Set<string>();
      sim.chambers.forEach((chamber) => {
        const fromLayout = roomLayouts.get(chamber.id);
        if (!fromLayout) return;

        chamber.connectedTo.forEach((targetId) => {
          const pairKey = [chamber.id, targetId].sort().join('--');
          if (drawnPairs.has(pairKey)) return;
          drawnPairs.add(pairKey);

          const toLayout = roomLayouts.get(targetId);
          if (!toLayout) return;

          ctx.save();
          ctx.strokeStyle = '#4a2e19';
          ctx.lineWidth = 32;
          ctx.lineCap = 'square';
          ctx.beginPath();
          ctx.moveTo(fromLayout.cx, fromLayout.floorY - 18);
          ctx.lineTo(toLayout.cx, toLayout.floorY - 18);
          ctx.stroke();

          ctx.strokeStyle = '#1f1209';
          ctx.lineWidth = 22;
          ctx.beginPath();
          ctx.moveTo(fromLayout.cx, fromLayout.floorY - 18);
          ctx.lineTo(toLayout.cx, toLayout.floorY - 18);
          ctx.stroke();

          // Tiny pixel lantern spark traveling between rooms
          const pulseT = (frameCount * 0.008) % 1;
          const px = Math.round(
            fromLayout.cx + (toLayout.cx - fromLayout.cx) * pulseT
          );
          const py = Math.round(
            fromLayout.floorY -
              18 +
              (toLayout.floorY - fromLayout.floorY) * pulseT
          );
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(px - 3, py - 3, 6, 6);
          ctx.restore();
        });
      });

      // 3. Draw 7 Pixel Art Underground Rooms (Square-stepped Pixel Borders)
      const newRoomHitBoxes: RoomHitBox[] = [];

      sim.chambers.forEach((chamber) => {
        const layout = roomLayouts.get(chamber.id);
        if (!layout) return;

        const rx = Math.round(layout.cx - layout.width * 0.5);
        const ry = Math.round(layout.cy - layout.height * 0.5);
        const rw = Math.round(layout.width);
        const rh = Math.round(layout.height);
        const isSelected = selectedChamberRef.current === chamber.id;
        const isQuestTarget = questTargetRef.current === chamber.id;
        const accentHex = CHAMBER_ACCENT_HEX[chamber.type] || '#f59e0b';

        newRoomHitBoxes.push({
          chamberId: chamber.id,
          x: rx,
          y: ry,
          w: rw,
          h: rh,
        });

        ctx.save();

        // Outer dark pixel border block
        ctx.fillStyle = '#0f0804';
        ctx.fillRect(rx - 6, ry - 6, rw + 12, rh + 12);

        // Clip interior to crisp pixel rectangle
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();

        // Draw quantized 16-bit Pixel Art Room Interior
        const chamberPixCanvas = chamberPixelCanvasesRef.current[chamber.type];
        if (chamberPixCanvas) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(chamberPixCanvas, rx, ry, rw, rh);
          ctx.fillStyle = 'rgba(18, 10, 5, 0.25)';
          ctx.fillRect(rx, ry, rw, rh);
        } else {
          ctx.fillStyle = '#2b1a10';
          ctx.fillRect(rx, ry, rw, rh);
        }

        // Pixel Art Wooden Plank Floor where 2D pixel rats walk
        const floorTopY = Math.round(layout.floorY);
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(rx, floorTopY, rw, ry + rh - floorTopY);
        ctx.fillStyle = '#8c5830';
        ctx.fillRect(rx, floorTopY, rw, 4);
        // Pixel floor plank seams
        ctx.fillStyle = '#3b2313';
        for (let px = rx + 24; px < rx + rw; px += 28) {
          ctx.fillRect(px, floorTopY, 2, ry + rh - floorTopY);
        }

        // Top Pixel Room Sign Banner
        ctx.fillStyle = '#170d07';
        ctx.fillRect(rx, ry, rw, 25);

        // Room Level Tag
        ctx.fillStyle = accentHex;
        ctx.fillRect(rx + 4, ry + 4, 38, 17);
        ctx.fillStyle = '#090604';
        ctx.font = '900 10px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText(`LV.${chamber.level}`, rx + 9, ry + 16);

        // Player-Friendly Room Production Badge (+FOOD, +SHROOMS, +MOOD)
        let outputLabel = `+${chamber.stressMitigationPerTick.toFixed(0)} MOOD`;
        if (chamber.atpProductionPerTick >= chamber.myceliumProductionPerTick) {
          outputLabel = `+${chamber.atpProductionPerTick.toFixed(0)} FOOD`;
        } else {
          outputLabel = `+${chamber.myceliumProductionPerTick.toFixed(0)} SHROOMS`;
        }

        ctx.fillStyle = '#fde68a';
        ctx.font = '800 10px ui-monospace, SFMono-Regular, Menlo, monospace';
        const labelWidth = ctx.measureText(outputLabel).width;
        ctx.fillText(outputLabel, rx + rw - labelWidth - 8, ry + 16);

        // Room Name in Lintel (truncated cleanly)
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11px ui-monospace, SFMono-Regular, Menlo, monospace';
        const maxTitleW = Math.max(70, rw - labelWidth - 62);
        let displayTitle = chamber.name.toUpperCase();
        while (
          displayTitle.length > 6 &&
          ctx.measureText(displayTitle).width > maxTitleW
        ) {
          displayTitle = `${displayTitle.slice(0, -2).trim()}..`;
        }
        ctx.fillText(displayTitle, rx + 48, ry + 16);

        // Pixel progress bar under room sign
        const cycleProg = (frameCount * 0.006 + chamber.level * 0.17) % 1;
        ctx.fillStyle = '#2d1c10';
        ctx.fillRect(rx, ry + 23, rw, 3);
        ctx.fillStyle = accentHex;
        ctx.fillRect(rx, ry + 23, Math.round(rw * cycleProg), 3);

        ctx.restore(); // End room clip

        // Crisp Double Pixel Frame around Room
        ctx.strokeStyle = isSelected
          ? '#fbbf24'
          : isQuestTarget
          ? '#4ade80'
          : '#78492a';
        ctx.lineWidth = isSelected || isQuestTarget ? 4 : 3;
        ctx.strokeRect(rx, ry, rw, rh);

        // Quest Target Pulsing Pixel Pointer Banner
        if (isQuestTarget) {
          const bounceY = Math.round(Math.sin(frameCount * 0.12) * 3);
          const qBannerW = 148;
          const qBannerX = Math.round(layout.cx - qBannerW * 0.5);
          const qBannerY = ry - 22 + bounceY;

          ctx.fillStyle = '#22c55e';
          ctx.fillRect(qBannerX, qBannerY, qBannerW, 18);
          ctx.strokeStyle = '#052e16';
          ctx.lineWidth = 2;
          ctx.strokeRect(qBannerX, qBannerY, qBannerW, 18);

          ctx.fillStyle = '#052e16';
          ctx.font = '900 10px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.fillText('ROYAL TASK: TAP HALL', qBannerX + 12, qBannerY + 13);
        }

        ctx.restore();
      });

      // 4. Render 24 Animated 2D Pixel Art Rat Villagers
      const newRatHitBoxes: RatHitBox[] = [];
      const bank = spriteBankRef.current;

      const chamberOccupants = new Map<string, RatAgent[]>();
      sim.agents.forEach((rat) => {
        const list = chamberOccupants.get(rat.chamberId) || [];
        list.push(rat);
        chamberOccupants.set(rat.chamberId, list);
      });

      sim.agents.forEach((rat, globalIdx) => {
        const layout =
          roomLayouts.get(rat.chamberId) ||
          roomLayouts.get('chamber_throne') ||
          Array.from(roomLayouts.values())[0];
        if (!layout) return;

        const occupants = chamberOccupants.get(rat.chamberId) || [rat];
        const slotIndex = occupants.findIndex((r) => r.id === rat.id);
        const slotCount = Math.max(1, occupants.length);

        let loco = ratLocomotionRef.current.get(rat.id);
        const maxFloorHalfSpan = layout.width * 0.36;
        if (!loco) {
          const initialSpread =
            slotCount === 1
              ? 0
              : (slotIndex / (slotCount - 1) - 0.5) * (maxFloorHalfSpan * 1.6);
          loco = {
            localOffsetX: initialSpread,
            targetOffsetX: initialSpread + (slotIndex % 2 === 0 ? 36 : -36),
            facingRight: slotIndex % 2 === 0,
            pauseTimer: (globalIdx * 23) % 90,
            animSeed: globalIdx * 17,
          };
          ratLocomotionRef.current.set(rat.id, loco);
        }

        const dx = loco.targetOffsetX - loco.localOffsetX;
        let isWalking = false;

        if (Math.abs(dx) > 1.8 && loco.pauseTimer <= 0) {
          isWalking = true;
          const speed = rat.caste === 'Forager' ? 0.85 : 0.62;
          loco.localOffsetX += Math.sign(dx) * speed;
          loco.facingRight = dx > 0;
        } else {
          if (loco.pauseTimer > 0) {
            loco.pauseTimer--;
          } else {
            loco.pauseTimer = 75 + ((globalIdx * 29 + frameCount) % 110);
            const pseudoRand =
              Math.sin(frameCount * 0.037 + globalIdx * 4.13) * 0.5 + 0.5;
            loco.targetOffsetX = (pseudoRand - 0.5) * 2 * maxFloorHalfSpan;
          }
        }

        // Snap coordinates to integer pixel positions for authentic pixel art movement
        const ratWorldX = Math.round(layout.cx + loco.localOffsetX);
        const ratFloorY = Math.round(
          layout.floorY + ((slotIndex % 3) - 1) * 2
        );
        const isSelected = selectedRatRef.current === rat.id;

        const animType = selectSpriteAnimForAgent(
          rat.caste,
          rat.posture,
          isWalking
        );
        const casteColor = CASTE_ACCENT_HEX[rat.caste] || '#f59e0b';

        const baseSpriteH = Math.round(
          (animType === 'rear' ? 54 : animType === 'dig' ? 42 : 40) *
            (rat.caste === 'Ruler' ? 1.18 : 1.0)
        );

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // Pixelated shadow bar under feet
        ctx.fillStyle = isSelected ? '#fbbf24' : 'rgba(0, 0, 0, 0.55)';
        const shadowW = Math.round(baseSpriteH * 1.1);
        ctx.fillRect(
          ratWorldX - Math.round(shadowW * 0.5),
          ratFloorY - 2,
          shadowW,
          4
        );

        let drawnW = Math.round(baseSpriteH * 1.4);
        let drawnH = baseSpriteH;

        if (bank && bank.ready && bank.frames[animType]?.length > 0) {
          const seq = bank.frames[animType];
          const ticksPerFrame =
            animType === 'walk' ? 8 : animType === 'dig' ? 9 : 14;
          const frameIdx =
            Math.floor((frameCount + loco.animSeed) / ticksPerFrame) %
            seq.length;
          const spriteFrame = seq[frameIdx];

          drawnH = baseSpriteH;
          drawnW = Math.round(baseSpriteH * spriteFrame.aspectRatio);

          ctx.save();
          ctx.imageSmoothingEnabled = false;
          // Stepped 2-pixel retro walk hop
          const walkBobY =
            isWalking && Math.floor((frameCount + loco.animSeed) / 6) % 2 === 0
              ? 2
              : 0;

          ctx.translate(ratWorldX, ratFloorY - walkBobY);
          if (!loco.facingRight) {
            ctx.scale(-1, 1);
          }

          ctx.drawImage(
            spriteFrame.canvas,
            -Math.round(drawnW * 0.5),
            -drawnH + 3,
            drawnW,
            drawnH
          );
          ctx.restore();
        }

        newRatHitBoxes.push({
          ratId: rat.id,
          x: ratWorldX - drawnW * 0.55,
          y: ratFloorY - drawnH - 6,
          w: drawnW * 1.1,
          h: drawnH + 10,
        });

        // Pixel role diamond indicator above rat
        const pipY = ratFloorY - drawnH - 6;
        ctx.fillStyle = casteColor;
        ctx.fillRect(ratWorldX - 3, pipY - 3, 6, 6);

        // Nameplate for Selected Rat or King Barnaby
        if (isSelected || rat.id === 'rat_1') {
          const tagText = rat.name.toUpperCase();
          ctx.font = '900 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
          const tw = Math.round(ctx.measureText(tagText).width + 10);
          const tx = Math.round(ratWorldX - tw * 0.5);
          const ty = pipY - 19;

          ctx.fillStyle = isSelected ? '#fbbf24' : '#1c1008';
          ctx.fillRect(tx, ty, tw, 14);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(tx, ty, tw, 14);

          ctx.fillStyle = isSelected ? '#090604' : '#fde68a';
          ctx.fillText(tagText, tx + 5, ty + 10.5);
        }

        ctx.restore();
      });

      ratHitBoxesRef.current = newRatHitBoxes;
      roomHitBoxesRef.current = newRoomHitBoxes;

      ctx.restore(); // End World Transform
      ctx.restore(); // End DPR Scale

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const screenToWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { wx: 0, wy: 0 };
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const cw = rect.width;
    const ch = rect.height;

    const isPortraitMobile = cw < 640;
    const worldW = isPortraitMobile ? MOBILE_WORLD_W : VIRTUAL_WORLD_W;
    const worldH = isPortraitMobile ? MOBILE_WORLD_H : VIRTUAL_WORLD_H;

    const fitScaleX = cw / worldW;
    const fitScaleY = ch / worldH;
    const baseScale = isPortraitMobile
      ? Math.min(fitScaleX * 0.96, fitScaleY * 0.88)
      : Math.min(fitScaleX * 0.98, fitScaleY * 0.92);

    const cam = cameraRef.current;
    const effectiveScale = baseScale * cam.zoom;
    const worldOriginX = (cw - worldW * effectiveScale) * 0.5 + cam.panX;
    const worldOriginY =
      (ch - worldH * effectiveScale) * (isPortraitMobile ? 0.42 : 0.52) +
      cam.panY;

    return {
      wx: (sx - worldOriginX) / effectiveScale,
      wy: (sy - worldOriginY) / effectiveScale,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    cam.isDragging = true;
    cam.dragStartX = e.clientX;
    cam.dragStartY = e.clientY;
    cam.panStartX = cam.panX;
    cam.panStartY = cam.panY;
    cam.pointerMovedDistance = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    if (!cam.isDragging) return;
    const dx = e.clientX - cam.dragStartX;
    const dy = e.clientY - cam.dragStartY;
    cam.pointerMovedDistance = Math.hypot(dx, dy);
    cam.panX = Math.max(-420, Math.min(420, cam.panStartX + dx));
    cam.panY = Math.max(-320, Math.min(320, cam.panStartY + dy));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    cam.isDragging = false;

    if (cam.pointerMovedDistance < 10) {
      const { wx, wy } = screenToWorld(e.clientX, e.clientY);

      const rats = ratHitBoxesRef.current;
      for (let i = rats.length - 1; i >= 0; i--) {
        const b = rats[i];
        if (wx >= b.x && wx <= b.x + b.w && wy >= b.y && wy <= b.y + b.h) {
          onSelectRat(b.ratId);
          return;
        }
      }

      const rooms = roomHitBoxesRef.current;
      for (let i = 0; i < rooms.length; i++) {
        const r = rooms[i];
        if (wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h) {
          onSelectChamber(r.chamberId);
          return;
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    cam.zoom = Math.max(0.75, Math.min(1.85, cam.zoom + delta));
  };

  const adjustZoom = (delta: number) => {
    const cam = cameraRef.current;
    cam.zoom = Math.max(0.75, Math.min(1.85, +(cam.zoom + delta).toFixed(2)));
  };

  const resetCamera = () => {
    cameraRef.current.panX = 0;
    cameraRef.current.panY = 0;
    cameraRef.current.zoom = 1;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#120904] select-none touch-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          cameraRef.current.isDragging = false;
        }}
        onWheel={handleWheel}
        style={{ imageRendering: 'pixelated' }}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* 2D Game Sprite Camera Controls (44x44px Ergonomic Touch Targets) */}
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => adjustZoom(0.2)}
          title="Look Closer"
          className="w-11 h-11 bg-[#23140b] border-2 border-amber-500 p-0.5 shadow-md active:translate-y-0.5 transition flex items-center justify-center cursor-pointer"
        >
          <img
            src={assets.uiSprites.iconZoomIn}
            alt="Look Closer"
            className="w-full h-full object-cover"
          />
        </button>
        <button
          type="button"
          onClick={() => adjustZoom(-0.2)}
          title="Look Wider"
          className="w-11 h-11 bg-[#23140b] border-2 border-amber-500 p-0.5 shadow-md active:translate-y-0.5 transition flex items-center justify-center cursor-pointer"
        >
          <img
            src={assets.uiSprites.iconZoomOut}
            alt="Look Wider"
            className="w-full h-full object-cover"
          />
        </button>
        <button
          type="button"
          onClick={resetCamera}
          title="Center Burrow"
          className="w-11 h-11 bg-[#23140b] border-2 border-amber-500 p-0.5 shadow-md active:translate-y-0.5 transition flex items-center justify-center cursor-pointer"
        >
          <img
            src={assets.uiSprites.iconRecenter}
            alt="Center Burrow"
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      {!spritesReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#120904]/80 z-30 pointer-events-none">
          <div className="px-4 py-2.5 bg-[#23140b] border-2 border-amber-500 text-amber-300 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
            <img src={assets.crestEmblem} alt="" className="w-5 h-5 object-cover" />
            Opening the Great Oak Burrow...
          </div>
        </div>
      )}
    </div>
  );
};
