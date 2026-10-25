---
name: game-audit-superskill
description: Comprehensive 5-Pillar Game Development Audit Super-Skill covering Diegetic Narrative Integrity (Fourth-Wall Discipline), 100% 2D Sprite UI & Branding Architecture, Game Mechanics & Economy Balance, Mobile Touch Controls & Thumb-Zone Ergonomics, and Automated Regression Prevention Gates.
---

# Game Development Audit Super-Skill (`game-audit-superskill`)

Use this skill to audit, critique, fix, and permanently guard 2D mobile games against immersion-breaking copy, developer UI leakage, missing 2D sprite branding/UI assets, broken mechanics, and poor touch ergonomics.

---

## Pillar 1: Diegetic Narrative Integrity & Fourth-Wall Discipline (Verisimilitude)

### What Discipline Is Violated When "Pixel", "2D", or "16-Bit" Appears in Game Copy?
In game design and narrative architecture, exposing the rendering medium or technical implementation to the player violates **Narrative Diegesis (In-Universe Verisimilitude / Fourth-Wall Integrity)**.
- **Diegetic Text** exists *inside* the fictional world (e.g., *"36 Loyal Subjects Ready to Serve the Acorn Crown"*, *"Scrolls of the Oak Root Clan"*).
- **Meta / Medium-Leakage Text** breaks the fourth wall by reminding the player they are looking at computer graphics (e.g., *"36 Pixel Rat Villagers"*, *"16-Bit Underground Kingdom Builder"*, *"Pixel Edition"*, *"2D pixel-art"*). In the world of King Barnaby, rats are flesh-and-fur creatures of the Great Oak — they do not know they are made of pixels!

### Mandatory Diegetic Copy Audit Rules
1. **Zero Medium-Leakage Words**: Never allow user-facing strings to contain:
   - `pixel`, `pixels`, `pixel-art`, `16-bit`, `32-bit`, `8-bit`, `2D`, `3D`, `sprite`, `sprites`, `spritesheet`, `canvas`, `cutaway`, `edition`, `simulator`, `simulation`, `builder`, `game`, `UI`, `HUD`, `tab`, `modal`, `drawer`, `button`, `click`.
2. **Zero Backend / Scientific / AI Jargon**: Never allow user-facing strings to contain:
   - `Sogni`, `Flux`, `AI`, `Bio-AI`, `ATP`, `Mycelium`, `Kleiber`, `Calhoun`, `Hamilton`, `NR3C1`, `FOXP2`, `BDNF`, `MUP20`, `kHz`, `mg/dL`, `BPM`, `Encephalization`, `Eusociality`.
3. **Zero ASCII Symbol Placeholders for Icons**: Never use text symbols like `[X]`, `[+]`, `[DONE]`, `?`, `+`, `-`, `FIT`, `>>`, or `<<` where a 2D game sprite icon belongs.

---

## Pillar 2: 100% 2D Game Sprite Branding & UI Architecture

A true 2D sprite game does not rely on raw CSS boxes or plain HTML text headers for its branding, menus, or controls. Every visual element must be backed by bespoke 2D game sprite assets:
- [ ] **Brand Wordmark Sprite (`ui_wordmark_logo.jpg`)**: Ornate illustrated 2D game title wordmark displayed prominently on the Title Screen and in the Kingdom Banner.
- [ ] **2D Sprite Button Plates (`ui_wood_button_gold.jpg`)**: Carved wood and gilded metal sprite textures backing all interactive buttons with tactile press states.
- [ ] **2D Sprite Panel / Scroll Frames (`ui_parchment_banner.jpg`)**: Illustrated wooden & parchment frames for quest banners, room upgrade panels, and royal scrolls.
- [ ] **2D Sprite Bottom Menu Dock Icons**:
  - `ui_tab_burrow.jpg` (The Great Burrow)
  - `ui_tab_clan.jpg` (Royal Subjects / Clan)
  - `ui_tab_laws.jpg` (Royal Decrees / Scrolls)
  - `ui_tab_quests.jpg` (Elder's Quests & Crown Goal)
- [ ] **2D Sprite Header & Canvas Control Icons**:
  - `ui_icon_help.jpg` (Royal Lore Book)
  - `ui_icon_sun_day.jpg` (Advance Dawn / Sundial)
  - `ui_icon_play_pause.jpg` (Hourglass Time Flow)
  - `ui_icon_horn_event.jpg` (Royal Herald Horn)
  - `ui_icon_zoom_in.jpg` (Brass Magnifier +)
  - `ui_icon_zoom_out.jpg` (Brass Spyglass -)
  - `ui_icon_recenter.jpg` (Royal Compass Rose)
  - `ui_icon_close.jpg` (Red Wax Seal Cross)

---

## Pillar 3: Core Loop, Mechanics & In-World Guidance Audit

- [ ] **Clear Overarching Victory Condition**: Players must immediately understand their ultimate royal duty (*Crown of the Great Oak: Grow the Clan to 60 Subjects, Fulfill Elder Whiskers' 5 Royal Quests, and Expand the Burrow Halls*).
- [ ] **Diegetic Onboarding & Mentor Guidance**: Elder Whiskers guides the ruler in-character with step-by-step royal tasks, 1-tap camera guidance (*"Lead Me There"*), and treasury rewards (*+Food & +Shrooms*).
- [ ] **Economy & Feedback Clarity**: Upgrading a hall immediately deducts Food & Shrooms, increases Subject Bed Capacity and daily output, and triggers an in-world herald notification.

---

## Pillar 4: Mobile Touch Controls & Thumb-Zone Ergonomics Audit

- [ ] **Thumb-Zone Primary Navigation**: Bottom dock houses the 4 primary kingdom views (`The Burrow`, `Clan Subjects`, `Royal Laws`, `Royal Quests`) with large sprite icons and `>= 48px` touch height.
- [ ] **Gesture Separation**: Dragging on the burrow canvas pans smoothly with inertia; tapping `< 8px` movement selects a hall or a scurrying rat subject without accidental triggers.
- [ ] **Sprite Camera Controls**: Dedicated right-edge sprite buttons (`Zoom In`, `Zoom Out`, `Center Burrow`) provide 1-thumb camera control on mobile screens.

---

## Pillar 5: Automated Prevention Gate (`scripts/runGameSuperAudit.ts`)

To prevent Medium-Leakage, Fourth-Wall violations, or missing 2D UI sprites from ever recurring:
1. Run `npx --yes tsx scripts/runGameSuperAudit.ts` before every build.
2. The script scans all user-facing source files (`src/App.tsx`, `src/components/BurrowCanvas.tsx`, `src/game/simulationEngine.ts`) for forbidden fourth-wall/medium/jargon words, checks that all 38 2D game sprite assets exist and are non-empty on disk, and verifies zero ASCII icon placeholders remain.
