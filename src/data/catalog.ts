import {CatalogItem} from '../services/types';

/**
 * Curated catalog of Creative-Commons / public-domain content with directly
 * streamable URLs. Using only freely-licensed media keeps the hackathon
 * submission legally clean while still giving the media player something real
 * to play. The Blender open movies are CC-BY; the Google sample shorts are
 * publicly hosted demo clips used widely for playback testing.
 *
 * Durations are approximate and used only for time-budget fitting.
 */
export const catalog: CatalogItem[] = [
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    synopsis:
      'A gentle giant rabbit turns the tables on three bullying rodents in this sunny, slapstick animated short.',
    genres: ['comedy', 'family', 'animation', 'short'],
    durationMin: 10,
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    posterUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    attribution: '© Blender Foundation — CC BY 3.0',
  },
  {
    id: 'sintel',
    title: 'Sintel',
    synopsis:
      'A lone warrior searches for the dragon she once befriended, in a sweeping, melancholy fantasy quest.',
    genres: ['fantasy', 'drama', 'adventure', 'animation'],
    durationMin: 15,
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    posterUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    attribution: '© Blender Foundation — CC BY 3.0',
  },
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel',
    synopsis:
      'In a ruined future Amsterdam, a band of warriors and scientists gamble on a memory to save the world from robots.',
    genres: ['sci-fi', 'action', 'drama'],
    durationMin: 12,
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    posterUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    attribution: '© Blender Foundation — CC BY 3.0',
  },
  {
    id: 'elephants-dream',
    title: "Elephants Dream",
    synopsis:
      'Two men wander a vast, shifting machine-world, arguing over what is real in this surreal animated first.',
    genres: ['sci-fi', 'drama', 'animation'],
    durationMin: 11,
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    posterUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    attribution: '© Blender Foundation — CC BY 2.5',
  },
  {
    id: 'for-bigger-blazes',
    title: 'For Bigger Blazes',
    synopsis:
      'A punchy one-minute showcase of big-screen action — perfect as a warm-up or a palate cleanser.',
    genres: ['action', 'short'],
    durationMin: 1,
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    attribution: 'Google sample media',
  },
  {
    id: 'for-bigger-fun',
    title: 'For Bigger Fun',
    synopsis:
      'A bright, upbeat short built for grins — quick, light, and easy to drop into any evening.',
    genres: ['comedy', 'family', 'short'],
    durationMin: 1,
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    attribution: 'Google sample media',
  },
  {
    id: 'for-bigger-escapes',
    title: 'For Bigger Escapes',
    synopsis:
      'A breezy getaway short — a little adventure and a lot of scenery in under a minute.',
    genres: ['adventure', 'family', 'short'],
    durationMin: 1,
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    attribution: 'Google sample media',
  },
];
