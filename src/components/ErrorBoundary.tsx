import React, {ErrorInfo, ReactNode} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, spacing, type} from '../theme/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time errors so a single bad screen can't blank the whole TV
 * app (per Vega best practices). Reports to console; wire to analytics later.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>Something went wrong.</Text>
          <Text style={styles.subtitle}>
            Please relaunch Couch Concierge.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...type.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...type.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
