import {Profile} from '../services/types';

/**
 * Default household taste profiles. In the demo the user taps "who's watching"
 * and the concierge reconciles the selected profiles' likes/dislikes.
 * A real app would persist these; for the hackathon spine they are seeded.
 */
export const profiles: Profile[] = [
  {
    id: 'sam',
    name: 'Sam',
    avatar: '😎',
    likes: ['comedy', 'family', 'animation'],
    dislikes: ['sci-fi'],
  },
  {
    id: 'riley',
    name: 'Riley',
    avatar: '🤓',
    likes: ['sci-fi', 'action', 'adventure'],
    dislikes: ['documentary'],
  },
  {
    id: 'mia',
    name: 'Mia',
    avatar: '🌙',
    likes: ['drama', 'fantasy', 'adventure'],
    dislikes: ['action'],
  },
  {
    id: 'leo',
    name: 'Leo',
    avatar: '🚀',
    likes: ['animation', 'adventure', 'family'],
    dislikes: ['drama'],
  },
];
