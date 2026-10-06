import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ErrorBoundary} from './components/ErrorBoundary';
import {AppNavigator} from './navigation/AppNavigator';
import {colors} from './theme/theme';

/**
 * Couch Concierge — a living-room AI that composes an evening for whoever's on
 * the couch. App root: error boundary + the screen navigator.
 */
export const App = () => (
  <View style={styles.root}>
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
