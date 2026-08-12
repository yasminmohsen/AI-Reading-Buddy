import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii } from '../theme/theme';

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const arNum = (n) => String(n).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);

function formatDuration(ms) {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${arNum(s)} ثانية`;
  return `${arNum(m)} د ${arNum(s)} ث`;
}

/**
 * pageStats: [{ pageNumber, attempts, firstTry: bool, wrongWords: string[] }]
 * durationMs: total time spent reading the book this run
 */
export default function ParentInsightCard({ pageStats = [], durationMs = 0 }) {
  const [open, setOpen] = useState(false);

  const total = pageStats.length;
  const firstTryCount = pageStats.filter((p) => p.firstTry).length;
  const retryPages = pageStats.filter((p) => !p.firstTry);
  const accuracy = total ? Math.round((firstTryCount / total) * 100) : 0;
  const practiceWords = [...new Set(retryPages.flatMap((p) => p.wrongWords || []))];

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => setOpen((o) => !o)}>
        <View style={styles.headerLeft}>
          <View style={styles.badge}>
            <Ionicons name="school-outline" size={16} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>نظرة لولي الأمر / المعلم</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>

      <View style={styles.statRow}>
        <Stat label="نسبة القراءة الصحيحة" value={`${arNum(accuracy)}%`} />
        <Stat label="مدة القراءة" value={formatDuration(durationMs)} />
        <Stat label="صفحات احتاجت إعادة" value={arNum(retryPages.length)} />
      </View>

      {open && (
        <View style={styles.details}>
          {practiceWords.length > 0 ? (
            <>
              <Text style={styles.detailsLabel}>كلمات يُنصح بالتدرب عليها:</Text>
              <View style={styles.chipWrap}>
                {practiceWords.map((w, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{w}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.detailsLabel}>لم يحتج الطفل لإعادة أي كلمة — أداء ممتاز!</Text>
          )}

          {retryPages.length > 0 && (
            <View style={{ marginTop: 10, gap: 6 }}>
              <Text style={styles.detailsLabel}>الصفحات التي احتاجت أكثر من محاولة:</Text>
              {retryPages.map((p) => (
                <View key={p.pageNumber} style={styles.pageRow}>
                  <Text style={styles.pageRowText}>صفحة {arNum(p.pageNumber)}</Text>
                  <Text style={styles.pageRowMuted}>{arNum(p.attempts)} محاولات</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 16,
    gap: 14,
  },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  badge: { width: 26, height: 26, borderRadius: 999, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.display, fontSize: 14, fontWeight: '700', color: colors.textDark },
  statRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  stat: { alignItems: 'center', gap: 2, flex: 1 },
  statValue: { fontFamily: fonts.display, fontSize: 17, fontWeight: '800', color: colors.primary },
  statLabel: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textMuted, textAlign: 'center' },
  details: { borderTopWidth: 1, borderTopColor: 'rgba(60,36,112,0.08)', paddingTop: 12 },
  detailsLabel: { fontFamily: fonts.body, fontSize: 12, fontWeight: '600', color: colors.textMuted70, textAlign: 'right' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', marginTop: 8 },
  chip: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999, backgroundColor: colors.chipBgSoft },
  chipText: { fontFamily: fonts.display, fontSize: 12, fontWeight: '700', color: colors.primary },
  pageRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: colors.bgSoft, borderRadius: radii.sm, paddingVertical: 8, paddingHorizontal: 12 },
  pageRowText: { fontFamily: fonts.body, fontSize: 12.5, fontWeight: '600', color: colors.textDark },
  pageRowMuted: { fontFamily: fonts.body, fontSize: 11.5, color: colors.textMuted },
});
