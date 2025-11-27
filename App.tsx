import React, { useEffect } from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { checkStoragePermission } from './src/utils/permissions';

export default function App() {
  useEffect(() => {
    // Check and request storage permission on app start
    checkStoragePermission();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
