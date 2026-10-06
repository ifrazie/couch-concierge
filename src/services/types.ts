/**
 * Core domain types for Couch Concierge.
 *
 * These types define the contract between the UI, the content catalog, and the
 * concierge that composes an evening. The proxy returns title IDs; the client
 * validates them and resolves media from its own catalog.
 */

/** A coarse genre vocabulary shared by the catalog and taste profiles. */
export type Genre =
  | 'comedy'
  | 'family'
  | 'animation'
  | 'drama'
  | 'fantasy'
  | 'adventure'
  | 'sci-fi'
  | 'action'
  | 'documentary'
  | 'short';

/** A single playable item of Creative-Commons / public-domain content. */
export interface CatalogItem {
  id: string;
  title: string;
  synopsis: string;
  genres: Genre[];
  /** Approximate runtime in minutes. */
  durationMin: number;
  /** Direct, freely-streamable video URL (no rights restrictions). */
  videoUrl: string;
  /** Poster / thumbnail URL. */
  posterUrl: string;
  /** Attribution line shown in the UI (license compliance). */
  attribution: string;
}

/** One viewer's tastes. Multiple profiles are reconciled into one plan. */
export interface Profile {
  id: string;
  name: string;
  /** Emoji avatar — cheap, expressive, and crisp on a TV. */
  avatar: string;
  likes: Genre[];
  dislikes: Genre[];
}

/** The user's request: who's watching + the free-text vibe + a time box. */
export interface EveningRequest {
  profiles: Profile[];
  vibe: string;
  /** Minutes available, e.g. "40 min before dinner". */
  timeBudgetMin: number;
}

/** A single scheduled item within a composed evening, with its rationale. */
export interface PlanItem {
  item: CatalogItem;
  /** Why the concierge chose this, phrased for the viewers by name. */
  reason: string;
}

/** The concierge's full response for one request. */
export interface EveningPlan {
  /** Visible provenance: never present local recommendations as model output. */
  source: 'bedrock' | 'local' | 'fallback';
  /** One-line framing of the whole evening. */
  summary: string;
  items: PlanItem[];
  /** Total scheduled runtime in minutes. */
  totalMin: number;
}

/**
 * Shared seam for local and Bedrock-backed composition.
 */
export interface Concierge {
  compose(request: EveningRequest): Promise<EveningPlan>;
}
