import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/theme';

export default function StarRow({ count = 5, filled = 0, size = 34, dim = 'rgba(255,255,255,0.28)' }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <Text key={i} style={[styles.star, { fontSize: size, color: i < filled ? colors.goldLight : dim }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  star: { fontFamily: fonts.display, fontWeight: '700', lineHeight: undefined },
});
