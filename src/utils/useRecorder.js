import { useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';

// High-quality mono recording preset (Deepgram handles standard sample rates well).
const RECORDING_OPTIONS = {
  isMeteringEnabled: false,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const recordingRef = useRef(null);

  const start = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      console.log('[mic] permission response:', perm);
      if (!perm.granted) {
        setPermissionDenied(true);
        return false;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: rec } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
      recordingRef.current = rec;
      setRecording(true);
      console.log('[mic] recording started');
      return true;
    } catch (err) {
      console.warn('[mic] Failed to start recording', err);
      return false;
    }
  }, []);

  const stop = useCallback(async () => {
    const rec = recordingRef.current;
    if (!rec) return null;
    try {
      const statusBefore = await rec.getStatusAsync();
      console.log('[mic] status before stop:', statusBefore);
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = rec.getURI();
      return uri;
    } catch (err) {
      console.warn('Failed to stop recording', err);
      return null;
    } finally {
      recordingRef.current = null;
      setRecording(false);
    }
  }, []);

  return { recording, permissionDenied, start, stop };
}
