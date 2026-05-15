// app/projects/geomelody/_lib/palette.ts
//
// Generates a cohesive 8-color palette from (scene, mood).
// Each scene has a base hue/saturation/lightness; mood modifies it.
// All cards share this palette so the three variants feel like a set.

export interface Palette {
  scene: string
  mood: string
  bg1: string         // top of background gradient
  bg2: string         // bottom of background gradient
  surface: string     // card surface (lighter than bg)
  fg: string          // primary text
  fgSoft: string      // secondary text
  accent: string      // titles, dots, highlights
  accentSoft: string  // muted accent
  divider: string     // hairlines / borders
}

const SCENE_BASE: Record<string, { h: number; s: number; l: number }> = {
  Café:    { h: 28,  s: 38, l: 55 }, // warm sepia
  Library: { h: 215, s: 18, l: 45 }, // cool slate
  Street:  { h: 8,   s: 28, l: 42 }, // muted brick
  Subway:  { h: 250, s: 32, l: 38 }, // electric indigo
  Park:    { h: 95,  s: 32, l: 45 }, // forest green
  Bedroom: { h: 280, s: 22, l: 48 }, // dusky lavender
  Gym:     { h: 0,   s: 55, l: 48 }, // hot crimson
}

const MOOD_MOD: Record<string, { ds: number; dl: number; dh: number }> = {
  Focused:    { ds: 0,   dl: 0,   dh: 0   },
  Relaxed:    { ds: -10, dl: +8,  dh: -5  },
  Stressed:   { ds: +18, dl: -6,  dh: +8  },
  Energetic:  { ds: +25, dl: +3,  dh: 0   },
  Sleepy:     { ds: -18, dl: +12, dh: -10 }, // cooler, paler, hue shifts blue
  Meditative: { ds: -12, dl: +6,  dh: -2  }, // desaturated, gently lit
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function hsl(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360
  return `hsl(${Math.round(hue)}, ${clamp(Math.round(s), 0, 100)}%, ${clamp(Math.round(l), 0, 100)}%)`
}

export function getPalette(scene: string, mood: string): Palette {
  const base = SCENE_BASE[scene] ?? SCENE_BASE.Café
  const mod  = MOOD_MOD[mood]   ?? MOOD_MOD.Focused

  const h = base.h + mod.dh
  const s = base.s + mod.ds
  const l = base.l + mod.dl

  return {
    scene,
    mood,
    bg1:        hsl(h,      Math.min(s, 30), Math.min(l + 30, 96)),
    bg2:        hsl(h + 18, Math.min(s, 22), Math.min(l + 40, 99)),
    surface:    hsl(h,      Math.min(s, 12), Math.min(l + 42, 99)),
    fg:         hsl(h,      Math.min(s + 5, 35), 14),
    fgSoft:     hsl(h,      Math.min(s, 18), 42),
    accent:     hsl(h,      Math.min(s + 25, 80), Math.max(l - 5, 30)),
    accentSoft: hsl(h,      Math.min(s + 5, 30), Math.min(l + 18, 80)),
    divider:    hsl(h,      Math.min(s, 12), Math.min(l + 35, 92)),
  }
}