import { View, Text, StyleSheet } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import PrimaryButton from './PrimaryButton';
import Siraj from './Siraj';
import { fonts, colors } from '../theme/theme';

export default function SirajIntroModal({ visible, onDismiss }) {
  return (
    <BottomSheetModal visible={visible}>
      <Siraj mood="cheering" size={96} />
      <Text style={styles.title}>لبيبو صديقك!</Text>
      <Text style={styles.body}>سيرافقك لبيبو في كل قصة، يستمع لقراءتك ويساعدك على النطق الصحيح.</Text>
      <PrimaryButton label="هيا ننطلق" onPress={onDismiss} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 22, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  body: { fontFamily: fonts.body, fontSize: 13, lineHeight: 22, color: colors.textMuted70, textAlign: 'center' },
});
