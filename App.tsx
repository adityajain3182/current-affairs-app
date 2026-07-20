import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ProgressProvider } from './src/state/ProgressContext';
import { RootTabs } from './src/navigation/RootTabs';
import { colors } from './src/theme';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProgressProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="dark" />
            <RootTabs />
          </NavigationContainer>
        </ProgressProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
