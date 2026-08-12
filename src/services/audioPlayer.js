import { Audio } from 'expo-av';

let currentSound = null;

/** Plays a bundled audio asset (require(...) result) and resolves when it finishes. */
export async function playSound(source) {
  if (currentSound) {
    await currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }
  const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
  currentSound = sound;
  return new Promise((resolve) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (currentSound === sound) currentSound = null;
        resolve();
      }
    });
  });
}

export async function stopSound() {
  if (currentSound) {
    await currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }
}
