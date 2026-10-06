import {CatalogItem, EveningRequest} from '../services/types';

/**
 * Typed route union for the linear concierge flow:
 *   home -> profiles -> vibe -> plan -> player
 *
 * A lightweight in-app router (see AppNavigator) walks this union. It is
 * intentionally the same shape react-navigation expects (name + params), so
 * migrating to `@amazon-devices/react-navigation` later is mechanical.
 */
export type Route =
  | {name: 'home'}
  | {name: 'profiles'}
  | {name: 'vibe'; selectedProfileIds: string[]}
  | {name: 'plan'; request: EveningRequest}
  | {name: 'player'; item: CatalogItem};

export type RouteName = Route['name'];

/** Navigation helpers handed to every screen. */
export interface Navigation {
  navigate: (route: Route) => void;
  goBack: () => void;
  canGoBack: boolean;
}
