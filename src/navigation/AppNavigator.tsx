import React, {useCallback, useMemo, useState} from 'react';
import {Navigation, Route} from './types';
import {HomeScreen} from '../screens/HomeScreen';
import {ProfilesScreen} from '../screens/ProfilesScreen';
import {VibeScreen} from '../screens/VibeScreen';
import {PlanScreen} from '../screens/PlanScreen';
import {PlayerScreen} from '../screens/PlayerScreen';

/**
 * Minimal stack navigator: keeps a route history array and renders the top
 * route. Swappable for `@amazon-devices/react-navigation` without touching the
 * screens, which already consume `route` + `navigation` props.
 */
export const AppNavigator = () => {
  const [stack, setStack] = useState<Route[]>([{name: 'home'}]);

  const navigate = useCallback((route: Route) => {
    setStack((prev) => [...prev, route]);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const current = stack[stack.length - 1];

  const navigation: Navigation = useMemo(
    () => ({navigate, goBack, canGoBack: stack.length > 1}),
    [navigate, goBack, stack.length],
  );

  switch (current.name) {
    case 'home':
      return <HomeScreen navigation={navigation} />;
    case 'profiles':
      return <ProfilesScreen navigation={navigation} />;
    case 'vibe':
      return <VibeScreen route={current} navigation={navigation} />;
    case 'plan':
      return <PlanScreen route={current} navigation={navigation} />;
    case 'player':
      return <PlayerScreen route={current} navigation={navigation} />;
  }
};
