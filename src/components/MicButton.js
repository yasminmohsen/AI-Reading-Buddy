import { useEffect, useRef } from 'react';
import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '../theme/theme';

export default function MicButton({ recording, onPress, disabled }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const bars = useRef([0, 1, 2, 3].map(() => new Animated.Value(0.35))).current;

  useEffect(() => {
    let loop;
    if (recording) {
      loop = Animated.loop(
        Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true })
      );
      pulse.setValue(0);
      loop.start();

      const barLoops = bars.map((b, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 150),
            Animated.timing(b, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(b, { toValue: 0.35, duration: 400, useNativeDriver: true }),
          ])
        )
      );
      barLoops.forEach((l) => l.start());
      return () => {
        loop?.stop();
        barLoops.forEach((l) => l.stop());
      };
    }
  }, [recording]);

  return (
    <View style={styles.wrap}>
      {recording && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulse,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] }) }],
            },
          ]}
        />
      )}
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.mic, { backgroundColor: recording ? colors.error : colors.primary, opacity: disabled ? 0.6 : 1 }, shadow.mic]}
      >
        {recording ? (
          <View style={styles.waveRow}>
            {bars.map((b, i) => (
              <Animated.View key={i} style={[styles.waveBar, { transform: [{ scaleY: b }] }]} />
            ))}
          </View>
        ) : (
          <Ionicons name="mic" size={34} color={colors.white} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  pulse: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 999,
    backgroundColor: 'rgba(106,61,214,0.35)',
  },
  mic: {
    width: 74,
    height: 74,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 30 },
  waveBar: { width: 5, height: 30, borderRadius: 999, backgroundColor: colors.white },
});
