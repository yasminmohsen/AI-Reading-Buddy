import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/theme';
import StarRow from '../components/StarRow';
import PrimaryButton from '../components/PrimaryButton';
import ParentInsightCard from '../components/ParentInsightCard';

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const arNum = (n) => String(n).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);

export default function ScoreScreen({ book, firstTryCount, pageStats, durationMs, onRetry, onGoHome }) {
  const total = book.pages.length;
  const ratio = total ? firstTryCount / total : 0;
  const filled = Math.max(1, Math.round(ratio * 5));
  const scoreMsg =
    filled >= 4 ? 'قراءة ممتازة يا بطل! أنت نجم القراءة اليوم.' : 'عمل جيد! تدرّب قليلاً وستجمع كل النجوم.';

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>أكملت القصة!</Text>
      <StarRow count={5} filled={filled} />

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>صفحات قرأتها صحيحة من أول محاولة</Text>
          <Text style={styles.statValue}>{arNum(firstTryCount)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.75)' }]}>عدد صفحات القصة</Text>
          <Text style={[styles.statValue, { color: 'rgba(255,255,255,0.75)' }]}>{arNum(total)}</Text>
        </View>
      </View>

      <Text style={styles.scoreMsg}>{scoreMsg}</Text>

      <ParentInsightCard pageStats={pageStats} durationMs={durationMs} />

      <View style={{ width: '100%', gap: 10, marginTop: 6 }}>
        <PrimaryButton label="اقرأ القصة مرة أخرى" variant="white" onPress={onRetry} />
        <PrimaryButton label="اختر قصة جديدة" variant="whiteGhost" onPress={onGoHome} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 26, paddingTop: 60, paddingBottom: 50 },
  title: { fontFamily: fonts.display, fontSize: 30, fontWeight: '800', color: colors.white, textAlign: 'center' },
  statsCard: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 22, paddingVertical: 18, paddingHorizontal: 20, width: '100%', gap: 10 },
  statRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  statLabel: { fontFamily: fonts.body, fontSize: 13, fontWeight: '600', color: colors.white },
  statValue: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.white },
  scoreMsg: { fontFamily: fonts.body, fontSize: 13, lineHeight: 22, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
});
