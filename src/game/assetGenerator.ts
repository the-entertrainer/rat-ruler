/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Sogni 2D Game Sprite Asset Registry
 * Serves 2D rat spritesheets, underground cutaway backgrounds,
 * room interiors, character portraits, resource badges, wordmark branding,
 * button plates, scroll panels, and menu/action sprite icons.
 */

import { CasteRole, ChamberType } from './simulationEngine';

export interface GameAssetPack {
  titleBackdrop: string;
  crestEmblem: string;
  burrowMapBg: string;
  cutawaySoilBg: string;
  ratFurTexture: string;
  soilTileTexture: string;
  spriteSheets: {
    walk: string;
    forager: string;
    rear: string;
    dig: string;
  };
  castePortraits: Record<CasteRole, string>;
  chamberArt: Record<ChamberType, string>;
  hudIcons: {
    population: string;
    atp: string;
    mycelium: string;
    eq: string;
    eusociality: string;
    stress: string;
  };
  uiSprites: {
    wordmarkLogo: string;
    woodButtonGold: string;
    parchmentBanner: string;
    tabBurrow: string;
    tabClan: string;
    tabLaws: string;
    tabQuests: string;
    iconHelp: string;
    iconSunDay: string;
    iconPlayPause: string;
    iconHornEvent: string;
    iconZoomIn: string;
    iconZoomOut: string;
    iconRecenter: string;
    iconClose: string;
  };
}

export function getGameAssetPack(): GameAssetPack {
  return {
    titleBackdrop: '/assets/sogni_pixel/pixel_title_bg.jpg',
    crestEmblem: '/assets/sogni_pixel/pixel_icon_crown.jpg',
    burrowMapBg: '/assets/sogni_pixel/pixel_underground_bg.jpg',
    cutawaySoilBg: '/assets/sogni_pixel/pixel_underground_bg.jpg',
    ratFurTexture: '/assets/sogni_pixel/pixel_portrait_gatherer.jpg',
    soilTileTexture: '/assets/sogni_pixel/pixel_underground_bg.jpg',
    spriteSheets: {
      walk: '/assets/sogni_pixel/pixel_rat_walk_sheet.jpg',
      forager: '/assets/sogni_pixel/pixel_rat_forage_sheet.jpg',
      rear: '/assets/sogni_pixel/pixel_rat_rear_sheet.jpg',
      dig: '/assets/sogni_pixel/pixel_rat_dig_sheet.jpg',
    },
    castePortraits: {
      Ruler: '/assets/sogni_pixel/pixel_portrait_king.jpg',
      Forager: '/assets/sogni_pixel/pixel_portrait_gatherer.jpg',
      Engineer: '/assets/sogni_pixel/pixel_portrait_miner.jpg',
      Savant: '/assets/sogni_pixel/pixel_portrait_elder.jpg',
      Matriarch: '/assets/sogni_pixel/pixel_portrait_caretaker.jpg',
      Vanguard: '/assets/sogni_pixel/pixel_portrait_guard.jpg',
    },
    chamberArt: {
      RoyalThrone: '/assets/sogni_pixel/pixel_room_throne.jpg',
      MyceliumGranary: '/assets/sogni_pixel/pixel_room_granary.jpg',
      BioluminescentNursery: '/assets/sogni_pixel/pixel_room_nursery.jpg',
      AcousticSensorium: '/assets/sogni_pixel/pixel_room_scout.jpg',
      DeepExcavationShaft: '/assets/sogni_pixel/pixel_room_mine.jpg',
      HydroConduit: '/assets/sogni_pixel/pixel_room_well.jpg',
      FermentationVault: '/assets/sogni_pixel/pixel_room_granary.jpg',
      VanguardBastion: '/assets/sogni_pixel/pixel_room_watchtower.jpg',
    },
    hudIcons: {
      population: '/assets/sogni_pixel/pixel_portrait_gatherer.jpg',
      atp: '/assets/sogni_pixel/pixel_icon_food.jpg',
      mycelium: '/assets/sogni_pixel/pixel_icon_shroom.jpg',
      eq: '/assets/sogni_pixel/pixel_icon_crown.jpg',
      eusociality: '/assets/sogni_pixel/pixel_icon_crown.jpg',
      stress: '/assets/sogni_pixel/pixel_icon_mood.jpg',
    },
    uiSprites: {
      wordmarkLogo: '/assets/sogni_pixel/ui_wordmark_logo.jpg',
      woodButtonGold: '/assets/sogni_pixel/ui_wood_button_gold.jpg',
      parchmentBanner: '/assets/sogni_pixel/ui_parchment_banner.jpg',
      tabBurrow: '/assets/sogni_pixel/ui_tab_burrow.jpg',
      tabClan: '/assets/sogni_pixel/ui_tab_clan.jpg',
      tabLaws: '/assets/sogni_pixel/ui_tab_laws.jpg',
      tabQuests: '/assets/sogni_pixel/ui_tab_quests.jpg',
      iconHelp: '/assets/sogni_pixel/ui_icon_help.jpg',
      iconSunDay: '/assets/sogni_pixel/ui_icon_sun_day.jpg',
      iconPlayPause: '/assets/sogni_pixel/ui_icon_play_pause.jpg',
      iconHornEvent: '/assets/sogni_pixel/ui_icon_horn_event.jpg',
      iconZoomIn: '/assets/sogni_pixel/ui_icon_zoom_in.jpg',
      iconZoomOut: '/assets/sogni_pixel/ui_icon_zoom_out.jpg',
      iconRecenter: '/assets/sogni_pixel/ui_icon_recenter.jpg',
      iconClose: '/assets/sogni_pixel/ui_icon_close.jpg',
    },
  };
}
