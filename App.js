import { useCallback, useState } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import * as SplashScreenNative from 'expo-splash-screen';
import { useFonts, BalooBhaijaan2_400Regular, BalooBhaijaan2_700Bold, BalooBhaijaan2_800ExtraBold } from '@expo-google-fonts/baloo-bhaijaan-2';
import { Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookReaderScreen from './src/screens/BookReaderScreen';
import ScoreScreen from './src/screens/ScoreScreen';
import { colors } from './src/theme/theme';
import { getBook } from './src/data/booksData';

SplashScreenNative.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    BalooBhaijaan2: BalooBhaijaan2_700Bold,
    BalooBhaijaan2_400: BalooBhaijaan2_400Regular,
    BalooBhaijaan2_800: BalooBhaijaan2_800ExtraBold,
    Cairo: Cairo_400Regular,
    Cairo_500: Cairo_500Medium,
    Cairo_600: Cairo_600SemiBold,
    Cairo_700: Cairo_700Bold,
  });

  const [screen, setScreen] = useState('splash'); // splash | home | book | score
  const [activeBookId, setActiveBookId] = useState(null);
  const [lastRun, setLastRun] = useState(null);

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreenNative.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.root} onLayout={onLayout}>
      <StatusBar barStyle={screen === 'home' ? 'light-content' : 'dark-content'} />

      {screen === 'splash' && <SplashScreen onDone={() => setScreen('home')} />}

      {screen === 'home' && (
        <HomeScreen
          onOpenBook={(id) => {
            setActiveBookId(id);
            setScreen('book');
          }}
        />
      )}

      {screen === 'book' && (
        <BookReaderScreen
          key={activeBookId}
          bookId={activeBookId}
          onGoHome={() => setScreen('home')}
          onFinishBook={(run) => {
            setLastRun(run);
            setScreen('score');
          }}
        />
      )}

      {screen === 'score' && lastRun && (
        <ScoreScreen
          book={getBook(activeBookId)}
          firstTryCount={lastRun.firstTryCount}
          pageStats={lastRun.pageStats}
          durationMs={lastRun.durationMs}
          onRetry={() => setScreen('book')}
          onGoHome={() => setScreen('home')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
