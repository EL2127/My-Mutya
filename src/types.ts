// src/types.ts
import type { PANEL_ORDER } from './constants';

export type PanelId = (typeof PANEL_ORDER)[number];

export interface Track {
  title: string;
  /** File names (inside /public) or links, tried in order. */
  src: string[];
  /** Optional Google Drive share link, used only as a backup. */
  drive?: string;
}

export interface AppConfig {
  herName: string;
  /** YYYY-MM-DD, the day you became a couple */
  startDate: string;
  littleThings: string[];
  letter: string;
  /** e.g. ['images/1.jpg', 'images/2.jpg'] (files live in /public/images) */
  photos: string[];
  backgroundVideo: string;
  music: Track[];
}
