import { useEffect, useRef } from 'react';
import { Modal, View, Animated, StyleSheet, Pressable } from 'react-native';
import { colors, radii, shadow } from '../theme/theme';

export default function BottomSheetModal({ visible, children }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} />
        <Animated.View
          style={[
            styles.sheet,
            shadow.modal,
            {
              opacity: anim,
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
                { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(38,18,80,0.45)',
    justifyContent: 'flex-end',
    padding: 18,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.xl + 6,
    padding: 24,
    paddingTop: 26,
    alignItems: 'center',
    gap: 14,
  },
});
