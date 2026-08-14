import { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/theme';

// Reference size the proportions below were designed at — every px value
// scales from this against the `size` prop.
const BASE = 84;

const MOOD = {
  idle: { body: 'float', duration: 3240, mouth: { w: 27, h: 14, r: [10, 10, 999, 999] }, eyeScaleY: 1 },
  listening: { body: 'calm', duration: 3564, mouth: { w: 17, h: 8, r: [8, 8, 999, 999] }, eyeScaleY: 1.12, rings: true },
  speaking: { body: 'wobble', duration: 1900, mouth: { w: 23, h: 18, r: [999, 999, 999, 999] }, eyeScaleY: 1, talk: true },
  cheering: { body: 'hop', duration: 1150, mouth: { w: 32, h: 22, r: [14, 14, 999, 999] }, eyeScaleY: 0.9, sparkles: true },
  nudge: { body: 'wobble', duration: 2600, mouth: { w: 13, h: 10, r: [999, 999, 999, 999] }, eyeScaleY: 0.8 },
  thinking: { body: 'calm', duration: 3400, mouth: { w: 11, h: 6, r: [999, 999, 999, 999] }, eyeScaleY: 0.95, dots: true },
  snoozing: { body: 'snooze', duration: 3800, mouth: null, eyeScaleY: 1, zzz: true },
};

const CONTINENTS = [
  { left: '8%', top: '12%', width: '16%', height: '34%', borderRadius: 999, rotate: '18deg', opacity: 0.85 },
  { left: '18%', top: '44%', width: '10%', height: '14%', borderRadius: 6, rotate: '20deg', opacity: 0.75 },
  { left: '4%', top: '56%', width: '11%', height: '22%', borderRadius: 999, rotate: '14deg', opacity: 0.6 },
  { left: '30%', bottom: '-6%', width: '44%', height: '32%', borderTopLeftRadius: '40%', borderTopRightRadius: '40%', opacity: 0.7 },
];

const GLOSS = [
  { right: '14%', top: '26%', width: '26%', height: 2, background: 'rgba(255,255,255,0.6)' },
  { right: '12%', top: '24%', width: '7%', height: '7%', borderRadius: 999, background: 'rgba(255,255,255,0.85)' },
  { right: '20%', top: '52%', width: 2, height: '22%', background: 'rgba(255,255,255,0.5)' },
  { right: '17%', top: '50%', width: '6%', height: '6%', borderRadius: 999, background: 'rgba(255,255,255,0.75)' },
  { left: '14%', top: '6%', width: '34%', height: '22%', borderRadius: 999, background: 'rgba(255,255,255,0.5)' },
];

function useLoop(duration, { delay = 0, easing = Easing.inOut(Easing.ease) } = {}) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(value, { toValue: 1, duration, easing, useNativeDriver: true }));
    const runner = Animated.sequence([Animated.delay(delay), loop]);
    value.setValue(0);
    runner.start();
    return () => runner.stop();
  }, [duration, delay]);
  return value;
}

function useBlink() {
  const value = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const cycle = Animated.sequence([
      Animated.timing(value, { toValue: 1, duration: 4784, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0.08, duration: 208, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(value, { toValue: 1, duration: 208, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]);
    const loop = Animated.loop(cycle);
    loop.start();
    return () => loop.stop();
  }, []);
  return value;
}

function bodyTransform(phase, body, k) {
  switch (body) {
    case 'float':
      return [
        { translateY: phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -14 * k, 0] }) },
        { rotate: phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-1.5deg', '1.5deg', '-1.5deg'] }) },
      ];
    case 'calm':
      return [{ translateY: phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -6 * k, 0] }) }];
    case 'hop':
      return [
        { translateY: phase.interpolate({ inputRange: [0, 0.2, 0.45, 0.7, 1], outputRange: [0, -26 * k, 0, -10 * k, 0] }) },
        { scaleX: phase.interpolate({ inputRange: [0, 0.2, 0.45, 0.7, 1], outputRange: [1, 0.94, 1.08, 0.98, 1] }) },
        { scaleY: phase.interpolate({ inputRange: [0, 0.2, 0.45, 0.7, 1], outputRange: [1, 1.07, 0.92, 1.02, 1] }) },
      ];
    case 'wobble':
      return [
        { translateY: phase.interpolate({ inputRange: [0, 0.25, 0.75, 1], outputRange: [0, -4 * k, -4 * k, 0] }) },
        { rotate: phase.interpolate({ inputRange: [0, 0.25, 0.75, 1], outputRange: ['0deg', '-5deg', '5deg', '0deg'] }) },
      ];
    case 'snooze':
      return [
        { translateY: phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 4 * k, 0] }) },
        { scaleX: phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.03, 1] }) },
        { scaleY: phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.97, 1] }) },
      ];
    default:
      return [];
  }
}

function Ring({ size, k, delay }) {
  const phase = useLoop(1800, { delay, easing: Easing.out(Easing.ease) });
  const scale = phase.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.5] });
  const opacity = phase.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: size / 2,
        borderWidth: 3 * k,
        borderColor: colors.siraj.ring,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

function Sparkle({ k, delay, color, top, left, right, bottom, sizePx }) {
  const phase = useLoop(1400, { delay });
  const scale = phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.5] });
  const rotate = phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '90deg', '0deg'] });
  const opacity = phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', top, left, right, bottom,
        width: sizePx * k, height: sizePx * k, backgroundColor: color,
        opacity, transform: [{ scale }, { rotate }],
        borderRadius: 3 * k,
      }}
    />
  );
}

function ThoughtDot({ k, delay }) {
  const phase = useLoop(1100, { delay });
  const translateY = phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -6 * k, 0] });
  const opacity = phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.35, 1, 0.35] });
  return (
    <Animated.View
      style={{
        width: 9 * k, height: 9 * k, borderRadius: 999,
        backgroundColor: colors.siraj.continent, opacity,
        transform: [{ translateY }],
      }}
    />
  );
}

function Zzz({ k, delay, fontSizePx, top, right }) {
  const phase = useLoop(2600, { delay, easing: Easing.out(Easing.ease) });
  const translateX = phase.interpolate({ inputRange: [0, 1], outputRange: [0, 18 * k] });
  const translateY = phase.interpolate({ inputRange: [0, 1], outputRange: [0, -34 * k] });
  const scale = phase.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] });
  const opacity = phase.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.9, 0] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top, right, opacity, transform: [{ translateX }, { translateY }, { scale }] }}>
      <Text style={{ color: colors.siraj.zzz, fontSize: fontSizePx * k, fontWeight: '700' }}>z</Text>
    </Animated.View>
  );
}

function Eye({ k, baseScaleY, blink, closed }) {
  const w = 10 * k;
  const h = closed ? 3 * k : 13 * k;
  const scaleY = closed ? 1 : Animated.multiply(baseScaleY, blink);
  return (
    <Animated.View style={{ width: w, height: h, borderRadius: 999, backgroundColor: colors.siraj.eye, transform: closed ? [] : [{ scaleY }] }}>
      {!closed && (
        <View style={{ position: 'absolute', left: '22%', top: '14%', width: '34%', height: '30%', borderRadius: 999, backgroundColor: '#fff' }} />
      )}
    </Animated.View>
  );
}

function Mouth({ k, config, talk }) {
  const phase = useLoop(400, {});
  const scaleY = talk ? phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.55, 1.25, 0.55] }) : 1;
  return (
    <Animated.View
      style={{
        width: config.w * k,
        height: config.h * k,
        borderTopLeftRadius: config.r[0] * k,
        borderTopRightRadius: config.r[1] * k,
        borderBottomRightRadius: config.r[2] * k,
        borderBottomLeftRadius: config.r[3] * k,
        backgroundColor: colors.siraj.mouth,
        overflow: 'hidden',
        transform: [{ scaleY }],
      }}
    >
      <View style={{ position: 'absolute', left: '22%', bottom: '-40%', width: '56%', height: '70%', borderRadius: 999, backgroundColor: colors.siraj.tongue }} />
    </Animated.View>
  );
}

export default function Siraj({ mood = 'idle', size = 84, style }) {
  const config = MOOD[mood] || MOOD.idle;
  const k = size / BASE;
  const phase = useLoop(config.duration, {});
  const glowPhase = useLoop(3600, {});
  const blink = useBlink();
  const closed = mood === 'snoozing';

  const glowOpacity = glowPhase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.9, 0.5] });

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Animated.View style={{ width: size, height: size, transform: bodyTransform(phase, config.body, k) }}>
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -0.24 * size, top: -0.24 * size, right: -0.24 * size, bottom: -0.24 * size,
            borderRadius: size,
            backgroundColor: colors.siraj.glowOuter,
            opacity: glowOpacity,
          }}
        />

        {config.rings && [0, 1, 2].map((i) => <Ring key={i} size={size} k={k} delay={i * 600} />)}

        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: size / 2, overflow: 'hidden', borderWidth: 2 * k, borderColor: colors.siraj.bodyBorder }}>
          <LinearGradient
            colors={colors.siraj.bodyGradient}
            locations={colors.siraj.bodyGradientLocations}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {CONTINENTS.map((c, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: c.left, top: c.top, right: c.right, bottom: c.bottom,
                width: c.width, height: c.height,
                borderRadius: c.borderRadius,
                borderTopLeftRadius: c.borderTopLeftRadius,
                borderTopRightRadius: c.borderTopRightRadius,
                backgroundColor: colors.siraj.continent,
                opacity: c.opacity,
                transform: c.rotate ? [{ rotate: c.rotate }] : undefined,
              }}
            />
          ))}

          {GLOSS.map((g, i) => (
            <View key={i} style={{ position: 'absolute', left: g.left, right: g.right, top: g.top, width: g.width, height: g.height, borderRadius: g.borderRadius, backgroundColor: g.background }} />
          ))}

          <View style={{ position: 'absolute', left: 0, right: 0, top: '34%', alignItems: 'center', gap: 5 * k }}>
            <View style={{ flexDirection: 'row', gap: 9 * k, alignItems: 'center' }}>
              <Eye k={k} baseScaleY={config.eyeScaleY} blink={blink} closed={closed} />
              <Eye k={k} baseScaleY={config.eyeScaleY} blink={blink} closed={closed} />
            </View>
            {config.mouth && <Mouth k={k} config={config.mouth} talk={config.talk} />}
          </View>

          <View style={{ position: 'absolute', left: '16%', top: '50%', width: '14%', height: '8%', borderRadius: 999, backgroundColor: colors.siraj.blush, opacity: 0.6 }} />
          <View style={{ position: 'absolute', right: '16%', top: '50%', width: '14%', height: '8%', borderRadius: 999, backgroundColor: colors.siraj.blush, opacity: 0.6 }} />
        </View>

        {config.dots && (
          <View style={{ position: 'absolute', top: -0.14 * size, left: 0, right: 0, flexDirection: 'row', gap: 7 * k, justifyContent: 'center' }}>
            {[0, 1, 2].map((i) => <ThoughtDot key={i} k={k} delay={i * 180} />)}
          </View>
        )}

        {config.sparkles && (
          <>
            <Sparkle k={k} delay={0} color={colors.siraj.sparkleGold} top={-0.1 * size} left={-0.08 * size} sizePx={16} />
            <Sparkle k={k} delay={350} color={colors.siraj.sparkleTeal} top={0.06 * size} right={-0.1 * size} sizePx={22} />
            <Sparkle k={k} delay={700} color={colors.siraj.sparklePink} bottom={-0.06 * size} right={0.08 * size} sizePx={14} />
          </>
        )}

        {config.zzz && (
          <>
            <Zzz k={k} delay={0} fontSizePx={20} top={-0.06 * size} right={'2%'} />
            <Zzz k={k} delay={900} fontSizePx={15} top={-0.02 * size} right={'10%'} />
          </>
        )}
      </Animated.View>
    </View>
  );
}
