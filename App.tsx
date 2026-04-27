import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/theme';
 
/**
 * Root of the application.
 *
 * NavigationContainer provides the navigation context for the entire tree.
 * AppNavigator owns the NativeStack → BottomTabs hierarchy.
 */
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <AppNavigator />
    </NavigationContainer>
  );
}