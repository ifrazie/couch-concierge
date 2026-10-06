import {catalog} from '../data/catalog';
import {
  CatalogItem,
  Concierge,
  EveningPlan,
  EveningRequest,
  Genre,
  PlanItem,
  Profile,
} from './types';

/**
 * Local, deterministic stand-in for the Bedrock-backed concierge.
 *
 * It reconciles the selected viewers' tastes against the catalog and fits a
 * sequence of titles into the available time budget, producing human-readable
 * rationale for each pick. This exercises the whole UI (loading -> plan ->
 * playback) with zero AWS dependency. In Week 3 we add `bedrockConcierge`
 * implementing the same `Concierge` interface, and flip a single import.
 */

const GENRE_MATCH_BONUS = 2;
const GENRE_DISLIKE_PENALTY = 4;
/** Small keyword hints let the free-text vibe nudge genre scores. */
const VIBE_KEYWORDS: Array<{words: string[]; genres: Genre[]}> = [
  {words: ['funny', 'laugh', 'comedy', 'light', 'silly'], genres: ['comedy']},
  {words: ['kid', 'family', 'wholesome', 'everyone'], genres: ['family']},
  {words: ['space', 'robot', 'future', 'sci', 'tech'], genres: ['sci-fi']},
  {words: ['action', 'intense', 'fight', 'thrill'], genres: ['action']},
  {words: ['epic', 'quest', 'adventure', 'journey'], genres: ['adventure']},
  {words: ['sad', 'deep', 'moving', 'drama', 'emotional'], genres: ['drama']},
  {words: ['magic', 'dragon', 'fantasy'], genres: ['fantasy']},
  {words: ['cartoon', 'animated', 'animation'], genres: ['animation']},
  {words: ['quick', 'short', 'fast'], genres: ['short']},
];

const uniqueGenres = (profiles: Profile[], key: 'likes' | 'dislikes'): Genre[] =>
  Array.from(new Set(profiles.flatMap((p) => p[key])));

const vibeGenres = (vibe: string): Genre[] => {
  const v = vibe.toLowerCase();
  return Array.from(
    new Set(
      VIBE_KEYWORDS.filter(({words}) => words.some((w) => v.includes(w))).flatMap(
        ({genres}) => genres,
      ),
    ),
  );
};

const scoreItem = (
  item: CatalogItem,
  likes: Genre[],
  dislikes: Genre[],
  wanted: Genre[],
): number => {
  let score = 0;
  for (const g of item.genres) {
    if (likes.includes(g)) score += GENRE_MATCH_BONUS;
    if (dislikes.includes(g)) score -= GENRE_DISLIKE_PENALTY;
    if (wanted.includes(g)) score += GENRE_MATCH_BONUS;
  }
  return score;
};

/** Name the viewers whose likes this item satisfies, for the rationale text. */
const fansOf = (item: CatalogItem, profiles: Profile[]): string[] =>
  profiles
    .filter((p) => item.genres.some((g) => p.likes.includes(g)))
    .map((p) => p.name);

const joinNames = (names: string[]): string => {
  if (names.length === 0) return 'everyone';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
};

const buildReason = (
  item: CatalogItem,
  profiles: Profile[],
  position: number,
): string => {
  const fans = fansOf(item, profiles);
  const genreLabel = item.genres.filter((g) => g !== 'short').slice(0, 2).join(' + ');
  if (position === 0) {
    return `Opening light with ${genreLabel} — a comfortable start ${joinNames(
      fans,
    )} will both enjoy.`;
  }
  return `${joinNames(fans)} lean toward ${genreLabel}, and at ${
    item.durationMin
  } min it fits neatly in the time you have left.`;
};

/** Greedily fit the best-scoring items under the time budget, shortest-first. */
const fitPlan = (
  ranked: CatalogItem[],
  timeBudgetMin: number,
  profiles: Profile[],
): PlanItem[] => {
  const chosen: PlanItem[] = [];
  let remaining = timeBudgetMin;
  for (const item of ranked) {
    if (item.durationMin <= remaining) {
      chosen.push({item, reason: buildReason(item, profiles, chosen.length)});
      remaining -= item.durationMin;
    }
    if (chosen.length >= 3) break;
  }
  // Guarantee at least one pick even for a tiny budget: take the shortest.
  if (chosen.length === 0 && ranked.length > 0) {
    const shortest = [...ranked].sort((a, b) => a.durationMin - b.durationMin)[0];
    chosen.push({item: shortest, reason: buildReason(shortest, profiles, 0)});
  }
  return chosen;
};

const buildSummary = (
  profiles: Profile[],
  items: PlanItem[],
  totalMin: number,
): string => {
  const who = joinNames(profiles.map((p) => p.name));
  if (items.length === 1) {
    return `A tight ${totalMin}-minute pick for ${who}.`;
  }
  return `${items.length} titles, ${totalMin} minutes total — paced for ${who}.`;
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

export const mockConcierge: Concierge = {
  async compose(request: EveningRequest): Promise<EveningPlan> {
    // Simulate the latency of a real model call so the loading UI is honest
    // and the Bedrock swap in Week 3 needs no UI changes.
    await delay(900);

    const {profiles, vibe, timeBudgetMin} = request;
    const likes = uniqueGenres(profiles, 'likes');
    const dislikes = uniqueGenres(profiles, 'dislikes');
    const wanted = vibeGenres(vibe);

    const ranked = [...catalog]
      .map((item) => ({item, score: scoreItem(item, likes, dislikes, wanted)}))
      .filter(({score}) => score > 0)
      .sort((a, b) => b.score - a.score || a.item.durationMin - b.item.durationMin)
      .map(({item}) => item);

    // Fall back to the full catalog if tastes exclude everything.
    const pool = ranked.length > 0 ? ranked : [...catalog];
    const items = fitPlan(pool, timeBudgetMin, profiles);
    const totalMin = items.reduce((sum, p) => sum + p.item.durationMin, 0);

    return {
      summary: buildSummary(profiles, items, totalMin),
      items,
      totalMin,
    };
  },
};
