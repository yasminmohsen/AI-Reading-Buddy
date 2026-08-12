import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, Pressable, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, shadow } from '../theme/theme';
import { getBook } from '../data/booksData';
import MicButton from '../components/MicButton';
import { StartModal, SuccessModal, ErrorModal, TurnModal } from '../components/ReaderModals';
import { useRecorder } from '../utils/useRecorder';
import { transcribeAudio } from '../services/deepgram';
import { matchTranscript, isPassingScore } from '../utils/arabicMatch';
import { playSound } from '../services/audioPlayer';

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const arNum = (n) => String(n).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);

const MATCH_THRESHOLD = 0.75; // within the required 70-80% band

export default function BookReaderScreen({ bookId, onGoHome, onFinishBook }) {
  const book = useMemo(() => getBook(bookId), [bookId]);
  const [pageIdx, setPageIdx] = useState(0);
  const [modal, setModal] = useState('start');
  const [status, setStatus] = useState('idle'); // idle | transcribing
  const [reviewMatch, setReviewMatch] = useState(null); // last match result, for word styling
  const [errorText, setErrorText] = useState(null);
  const attemptsRef = useRef({});
  const firstTryRef = useRef(0);
  const pageStatsRef = useRef([]);
  const startTimeRef = useRef(Date.now());
  const fade = useRef(new Animated.Value(1)).current;

  const { recording, permissionDenied, start, stop } = useRecorder();

  const page = book.pages[pageIdx];
  const total = book.pages.length;
  const isLastPage = pageIdx >= total - 1;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    setReviewMatch(null);
  }, [pageIdx]);

  const recordPageStat = (passed, matchResult) => {
    const attempts = (attemptsRef.current[pageIdx] || 0) + 1;
    attemptsRef.current[pageIdx] = attempts;
    if (passed && attempts === 1) firstTryRef.current += 1;

    const existingIdx = pageStatsRef.current.findIndex((p) => p.pageNumber === page.pageNumber);
    const entry = {
      pageNumber: page.pageNumber,
      attempts,
      firstTry: passed && attempts === 1,
      wrongWords: passed ? [] : matchResult?.wrongWords ?? [],
    };
    if (existingIdx >= 0) pageStatsRef.current[existingIdx] = entry;
    else pageStatsRef.current.push(entry);
  };

  const handleMicPress = async () => {
    if (recording) {
      const uri = await stop();
      console.log('[mic] recording stopped, file uri:', uri);
      if (!uri) {
        console.warn('[mic] no recording URI — recording likely failed to start/save');
        return;
      }
      setStatus('transcribing');
      try {
        const transcript = await transcribeAudio(uri);
        const result = matchTranscript(page.text, transcript, { wordThreshold: 0.72 });
        const passed = isPassingScore(result.score, { min: MATCH_THRESHOLD });
        console.log(
          `[match] page ${page.pageNumber} | reference: "${page.text}" | heard: "${transcript}" | ` +
            `score: ${(result.score * 100).toFixed(0)}% (need ${MATCH_THRESHOLD * 100}%) | ${passed ? 'PASS' : 'FAIL'}`
        );
        console.log('[match] word-by-word', result.refWords?.map((w, i) => ({ word: w, matched: result.matchedWords[i] })));
        setReviewMatch(result);
        recordPageStat(passed, result);
        setModal(passed ? 'success' : 'error');
      } catch (err) {
        console.warn('[match] Transcription failed', err);
        setErrorText('تعذّر الاتصال بخدمة التعرف على الصوت. حاول مرة أخرى.');
        recordPageStat(false, { wrongWords: [] });
        setModal('error');
      } finally {
        setStatus('idle');
      }
    } else {
      if (modal) return;
      await start();
    }
  };

  const handleNextPage = () => {
    setModal(null);
    if (isLastPage) {
      onFinishBook({
        firstTryCount: firstTryRef.current,
        pageStats: pageStatsRef.current,
        durationMs: Date.now() - startTimeRef.current,
      });
      return;
    }
    setPageIdx((i) => i + 1);
    setModal(null);
  };

  const handleListenToNarrator = async () => {
    setModal(null);
    setStatus('narrating');
    try {
      await playSound(page.audio);
    } catch (err) {
      console.warn('Narrator playback failed', err);
    }
    setStatus('idle');
    setModal('turn');
  };

  const hint =
    status === 'transcribing'
      ? 'لحظات… أستمع لما قرأته'
      : status === 'narrating'
      ? 'الراوي يقرأ الآن — استمع جيدًا'
      : recording
      ? 'أستمع إليك… اقرأ بصوت واضح'
      : 'اضغط على الميكروفون وابدأ القراءة';

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable onPress={onGoHome} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </Pressable>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((pageIdx + 1) / total) * 100}%` }]} />
          </View>
        </View>
        <View style={styles.pageChip}>
          <Text style={styles.pageChipText}>{arNum(pageIdx + 1)} / {arNum(total)}</Text>
        </View>
      </View>

      <Animated.View style={[styles.pageArea, { opacity: fade }]}>
        <View style={styles.pageCard}>
          {/* The real scanned book page — the printed Arabic text is already
              part of the artwork, so this image IS what the child reads from.
              `contain` guarantees the full page (and its text) is always
              visible, never cropped, regardless of screen size. */}
          <Image source={page.image} style={styles.pageImage} resizeMode="contain" />
          <View style={styles.pageFooter}>
            <Text style={styles.pageFooterText}>{book.title}</Text>
            <Text style={styles.pageFooterText}>صفحة {arNum(page.pageNumber)}</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.bottomArea}>
        <Text style={styles.hint}>{hint}</Text>
        {status === 'transcribing' || status === 'narrating' ? (
          <View style={styles.micPlaceholder}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : (
          <MicButton recording={recording} onPress={handleMicPress} disabled={!!modal} />
        )}
        {permissionDenied && (
          <Text style={styles.permWarning}>يرجى السماح باستخدام الميكروفون من إعدادات الجهاز.</Text>
        )}
      </View>

      <StartModal visible={modal === 'start'} onStart={() => setModal(null)} />
      <SuccessModal visible={modal === 'success'} isLastPage={isLastPage} onNext={handleNextPage} />
      <ErrorModal
        visible={modal === 'error'}
        wrongWords={errorText ? [] : reviewMatch?.wrongWords ?? []}
        onListen={handleListenToNarrator}
        onNotNow={() => { setModal(null); setErrorText(null); }}
      />
      <TurnModal visible={modal === 'turn'} onReady={() => setModal(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgSoft },
  topBar: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingTop: 58, paddingHorizontal: 18, paddingBottom: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  bookTitle: { fontFamily: fonts.display, fontSize: 15, fontWeight: '700', color: colors.textDark, textAlign: 'right' },
  progressTrack: { height: 6, borderRadius: 999, backgroundColor: 'rgba(106,61,214,0.14)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  pageChip: { paddingVertical: 6, paddingHorizontal: 11, borderRadius: 999, backgroundColor: colors.chipBg },
  pageChipText: { fontFamily: fonts.display, fontSize: 12.5, fontWeight: '700', color: colors.primary },

  pageArea: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  pageCard: {
    flex: 1,
    backgroundColor: colors.pageBg,
    borderRadius: 22,
    padding: 14,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  pageImage: { flex: 1, width: '100%', borderRadius: radii.md, backgroundColor: colors.chipBg },
  pageFooter: { width: '100%', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  pageFooterText: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted38 },

  bottomArea: { paddingVertical: 20, alignItems: 'center', gap: 12, paddingBottom: 30 },
  hint: { fontFamily: fonts.body, fontSize: 12.5, fontWeight: '600', color: colors.textMuted70, textAlign: 'center' },
  micPlaceholder: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  permWarning: { fontFamily: fonts.body, fontSize: 11.5, color: colors.error, textAlign: 'center', paddingHorizontal: 30 },
});
