import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, radii, shadow } from '../theme/theme';
import { BOOKS } from '../data/booksData';
import StarRow from '../components/StarRow';
import SirajIntroModal from '../components/SirajIntroModal';

const SIRAJ_INTRO_SEEN_KEY = 'siraj_intro_seen_v1';

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const arNum = (n) => String(n).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);

const GRID_GAP = 14;
const BODY_PADDING = 20;
const MAX_CONTENT_WIDTH = 960;
const CARD_PADDING = 10; // must match styles.card.padding below
// One fixed cover ratio for every card, regardless of each book's own source
// image proportions (altifla's is ~1:1, the others ~0.86) — using cover.
// imageAspectRatio per book made cells slightly different heights, which
// misaligned the title row across the grid. resizeMode="cover" crops each
// book's cover to this shape without distorting it.
const COVER_ASPECT_RATIO = 0.86;
const TITLE_LINE_HEIGHT = 19;

// Responsive column count: phones get 2, tablets/small web get 3, desktop web gets 4+.
function useColumns(width) {
  if (width >= 1100) return 5;
  if (width >= 820) return 4;
  if (width >= 560) return 3;
  return 2;
}

export default function HomeScreen({ weeklyStars = 3, onOpenBook }) {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, MAX_CONTENT_WIDTH);
  const columns = useColumns(contentWidth);
  const cardWidth = (contentWidth - BODY_PADDING * 2 - GRID_GAP * (columns - 1)) / columns;

  const [showSirajIntro, setShowSirajIntro] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SIRAJ_INTRO_SEEN_KEY).then((seen) => {
      if (!seen) setShowSirajIntro(true);
    });
  }, []);

  const dismissSirajIntro = () => {
    setShowSirajIntro(false);
    AsyncStorage.setItem(SIRAJ_INTRO_SEEN_KEY, '1');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40, alignItems: 'center' }}>
      <SirajIntroModal visible={showSirajIntro} onDismiss={dismissSirajIntro} />
      <View style={[styles.header, { maxWidth: MAX_CONTENT_WIDTH, width: '100%' }]}>
        <View style={styles.headerTop}>
          <View style={{ gap: 4 }}>
            <Text style={styles.greeting}>أهلاً يا بطل!</Text>
            <Text style={styles.greetingSub}>اختر قصة وابدأ القراءة بصوتك</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>س</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={{ gap: 3 }}>
            <Text style={styles.statsTitle}>نجومك هذا الأسبوع</Text>
            <Text style={styles.statsSub}>أكمل قصة جديدة لتجمع المزيد</Text>
          </View>
          <StarRow count={5} filled={weeklyStars} size={19} dim="rgba(255,255,255,0.3)" />
        </View>
      </View>

      <View style={[styles.body, { maxWidth: MAX_CONTENT_WIDTH, width: '100%' }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>مكتبة القصص</Text>
          <Text style={styles.sectionCount}>{arNum(BOOKS.length)} قصص</Text>
        </View>

        <View style={styles.grid}>
          {BOOKS.map((b) => {
            // aspectRatio as a style prop doesn't reliably compute height from
            // width on react-native-web with local require()'d images — it
            // falls back to the asset's raw intrinsic pixel height instead.
            // Computing both dimensions explicitly sidesteps that entirely.
            const coverWidth = cardWidth - CARD_PADDING * 2;
            const coverHeight = coverWidth / COVER_ASPECT_RATIO;
            return (
              <Pressable
                key={b.id}
                onPress={() => onOpenBook(b.id)}
                style={({ pressed }) => [
                  styles.card,
                  shadow.card,
                  { width: cardWidth },
                  pressed && { transform: [{ translateY: -2 }] },
                ]}
              >
                <Image
                  source={b.cover}
                  style={[styles.cover, { width: coverWidth, height: coverHeight }]}
                  resizeMode="cover"
                />
                <View style={{ paddingHorizontal: 4, paddingBottom: 4, gap: 3 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                  {b.title}
                </Text>
                  <Text style={styles.cardMeta}>{arNum(b.pages.length)} صفحات · {b.ageLabel}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgSoft },
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    paddingTop: 56,
    paddingHorizontal: 22,
    paddingBottom: 26,
    gap: 16,
  },
  headerTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  greeting: { fontFamily: fonts.display, fontSize: 25, fontWeight: '800', color: colors.white, textAlign: 'right' },
  greetingSub: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'right' },
  avatar: { width: 48, height: 48, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.display, fontSize: 20, fontWeight: '700', color: colors.white },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsTitle: { fontFamily: fonts.body, fontSize: 13.5, fontWeight: '700', color: colors.white, textAlign: 'right' },
  statsSub: { fontFamily: fonts.body, fontSize: 11.5, color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  body: { padding: BODY_PADDING, paddingTop: 22, gap: 14 },
  sectionHeader: { flexDirection: 'row-reverse', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: fonts.display, fontSize: 17, fontWeight: '700', color: colors.textDark },
  sectionCount: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted50 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: GRID_GAP },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: 10, gap: 9 },
  cover: { width: '100%', borderRadius: radii.md, backgroundColor: colors.chipBg },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 14.5,
    lineHeight: TITLE_LINE_HEIGHT,
    minHeight: TITLE_LINE_HEIGHT * 2, // reserve 2 lines so 1-line titles don't shrink the card
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'right',
  },
  cardMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted50, textAlign: 'right' },
});
