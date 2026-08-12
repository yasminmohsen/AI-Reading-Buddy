import { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/theme';

export default function SplashScreen({ onDone, durationMs = 2200 }) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
    const t = setTimeout(onDone, durationMs);
    return () => clearTimeout(t);
  }, []);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoBox, { transform: [{ translateY }] }]}>
        <Text style={styles.logoLetter}>ق</Text>
      </Animated.View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>القارئ الذكي</Text>
        <Text style={styles.subtitle}>اقرأ بصوتك… وأنا أسمعك</Text>
      </View>
      <View style={styles.dots}>
        <View style={[styles.dot, { opacity: 0.9 }]} />
        <View style={[styles.dot, { opacity: 0.5 }]} />
        <View style={[styles.dot, { opacity: 0.3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', gap: 22 },
  logoBox: {
    width: 118,
    height: 118,
    borderRadius: 34,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#200A50',
    shadowOpacity: 0.32,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  logoLetter: { fontFamily: fonts.display, fontSize: 62, fontWeight: '800', color: colors.primary },
  textWrap: { alignItems: 'center', gap: 7 },
  title: { fontFamily: fonts.display, fontSize: 36, fontWeight: '800', color: colors.white },
  subtitle: { fontFamily: fonts.body, fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.78)' },
  dots: { position: 'absolute', bottom: 64, flexDirection: 'row', gap: 7 },
  dot: { width: 9, height: 9, borderRadius: 999, backgroundColor: colors.white },
});
