import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark' | 'auto';

const COLOR_SCHEME_KEY = 'color_scheme';

export function useColorScheme() {
  const systemColorScheme = useNativeColorScheme();
  const [userPreference, setUserPreference] = useState<ColorScheme>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference
  useEffect(() => {
    loadColorScheme();
  }, []);

  const loadColorScheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(COLOR_SCHEME_KEY);
      if (saved) {
        setUserPreference(saved as ColorScheme);
      }
    } catch (error) {
      console.error('Error loading color scheme:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      setUserPreference(scheme);
      await AsyncStorage.setItem(COLOR_SCHEME_KEY, scheme);
    } catch (error) {
      console.error('Error saving color scheme:', error);
    }
  };

  // Determine the actual color scheme to use
  const colorScheme = userPreference === 'auto' ? systemColorScheme : userPreference;
  const isDark = colorScheme === 'dark';

  return {
    colorScheme: isDark ? 'dark' : 'light',
    isDark,
    userPreference,
    setColorScheme,
    isLoaded,
  };
}