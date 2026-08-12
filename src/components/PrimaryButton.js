import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fonts, radii } from '../theme/theme';

const VARIANTS = {
  primary: { bg: colors.primary, fg: colors.white },
  success: { bg: colors.success, fg: colors.white },
  ghost: { bg: colors.chipBgSoft, fg: colors.primary },
  white: { bg: colors.white, fg: colors.primary },
  whiteGhost: { bg: 'rgba(255,255,255,0.16)', fg: colors.white },
};

export default function PrimaryButton({ label, onPress, variant = 'primary', loading = false, disabled = false }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg, opacity: disabled ? 0.6 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={[styles.label, { color: v.fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '800',
  },
});
