import { View, Text, StyleSheet } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import PrimaryButton from './PrimaryButton';
import Siraj from './Siraj';
import { colors, fonts, radii } from '../theme/theme';

const STEPS = [
  { color: colors.primary, num: '١', text: 'اضغط على الميكروفون واقرأ الصفحة بصوت عالٍ وواضح.' },
  { color: colors.success, num: '٢', text: 'إذا قرأتها بشكل صحيح، سوف تنتقل إلى الصفحة التالية.' },
  { color: colors.gold, num: '٣', text: 'وإذا أخطأت، لا تقلق! لبيبو يسمعك النطق الصحيح ثم نجرب مرة أخرى.' },
];

export function StartModal({ visible, onStart }) {
  return (
    <BottomSheetModal visible={visible}>
      <Siraj mood="idle" size={84} />
      <Text style={styles.title}>هيا نقرأ معًا!</Text>
      <View style={{ width: '100%', gap: 9 }}>
        {STEPS.map((s) => (
          <View key={s.num} style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: s.color }]}>
              <Text style={styles.stepBadgeText}>{s.num}</Text>
            </View>
            <Text style={styles.stepText}>{s.text}</Text>
          </View>
        ))}
      </View>
      <PrimaryButton label="هيا بنا" onPress={onStart} />
    </BottomSheetModal>
  );
}

export function SuccessModal({ visible, isLastPage, onNext, tashkeelWords = [] }) {
  return (
    <BottomSheetModal visible={visible}>
      <Siraj mood="cheering" size={92} />
      <Text style={[styles.title, { color: colors.successDark }]}>أحسنت يا بطل!</Text>
      <Text style={styles.bodyText}>قرأت الصفحة بشكل رائع وبدون أخطاء.{'\n'}هيا ننتقل إلى الصفحة التالية!</Text>
      {tashkeelWords.length > 0 && (
        <View style={styles.tashkeelTip}>
          <Text style={styles.tashkeelTipText}>
            نصيحة صغيرة: انتبه لحركات كلمة{tashkeelWords.length > 1 ? ':' : ''}{' '}
            {tashkeelWords.map((w, i) => (
              <Text key={i} style={styles.tashkeelTipWord}>{w}{i < tashkeelWords.length - 1 ? '، ' : ''}</Text>
            ))}
          </Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <Text key={i} style={styles.smallStar}>★</Text>
        ))}
      </View>
      <PrimaryButton
        label={isLastPage ? 'أنهيت القصة!' : 'الصفحة التالية'}
        variant="success"
        onPress={onNext}
      />
    </BottomSheetModal>
  );
}

export function ErrorModal({ visible, wrongWords = [], onListen, onNotNow }) {
  return (
    <BottomSheetModal visible={visible}>
      <Siraj mood="nudge" size={84} />
      <Text style={styles.title}>لا بأس، حاول مرة أخرى</Text>
      <Text style={styles.bodyText}>
        {wrongWords.length > 0
          ? `هناك ${arNum(wrongWords.length)} كلمات تحتاج تدريبًا صغيرًا.\nهيا نستمع للنطق الصحيح من لبيبو.`
          : 'هيا نستمع للنطق الصحيح من لبيبو.'}
      </Text>
      {wrongWords.length > 0 && (
        <View style={styles.chipWrap}>
          {wrongWords.map((w, i) => (
            <View key={i} style={styles.wrongChip}>
              <Text style={styles.wrongChipText}>{w}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={{ width: '100%', gap: 9 }}>
        <PrimaryButton label="استمع للنطق الصحيح" onPress={onListen} />
        <PrimaryButton label="ليس الآن" variant="ghost" onPress={onNotNow} />
      </View>
    </BottomSheetModal>
  );
}

export function TurnModal({ visible, onReady }) {
  return (
    <BottomSheetModal visible={visible}>
      <Siraj mood="listening" size={92} />
      <Text style={styles.title}>حان دورك يا بطل!</Text>
      <Text style={styles.bodyText}>اقرأ الصفحة مرة أخرى بصوت واضح.{'\n'}أنا أستمع إليك بكل انتباه.</Text>
      <PrimaryButton label="أنا مستعد" onPress={onReady} />
    </BottomSheetModal>
  );
}

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function arNum(n) {
  return String(n).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);
}

const styles = StyleSheet.create({
  smallStar: { fontFamily: fonts.display, fontSize: 20, color: colors.gold, fontWeight: '700' },
  title: { fontFamily: fonts.display, fontSize: 22, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  bodyText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 22, color: colors.textMuted70, textAlign: 'center' },
  stepRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10, backgroundColor: colors.bgSoft, borderRadius: radii.md, padding: 12 },
  stepBadge: { width: 22, height: 22, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { fontFamily: fonts.display, fontSize: 12, fontWeight: '700', color: colors.white },
  stepText: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 20, color: colors.textDark, textAlign: 'right' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center' },
  wrongChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.errorBg },
  wrongChipText: { fontFamily: fonts.display, fontSize: 13, fontWeight: '700', color: colors.error },
  tashkeelTip: { backgroundColor: colors.chipBgSoft, borderRadius: radii.md, paddingVertical: 9, paddingHorizontal: 12, width: '100%' },
  tashkeelTipText: { fontFamily: fonts.body, fontSize: 12, lineHeight: 19, color: colors.textMuted70, textAlign: 'center' },
  tashkeelTipWord: { fontFamily: fonts.display, fontWeight: '700', color: colors.primary },
});

export { arNum };
