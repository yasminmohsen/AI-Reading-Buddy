import { Platform } from 'react-native';

const DEEPGRAM_API_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY;

// Neither nova-2 nor plain model=general support Arabic on this account
// (Deepgram's API rejects both with a 400 "no such model/language/tier
// combination"). Verified directly against the API: model=nova-3 is what
// actually accepts language=ar and returns real transcripts.
const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen?language=ar&model=nova-3';

// Fallback only used if the blob doesn't carry its own `type` (some native
// fetch()-from-file-URI implementations don't set it). Must match whatever
// useRecorder.js actually records on that platform, or Deepgram silently
// fails to decode the audio and returns an empty transcript.
const CONTENT_TYPE_FALLBACK = Platform.OS === 'web' ? 'audio/webm' : 'audio/mp4';

/**
 * Sends a recorded audio file (local URI from expo-av) to Deepgram's REST API
 * and returns the best transcript. Throws on network/API failure so the caller
 * can fall back gracefully.
 */
export async function transcribeAudio(fileUri) {
  if (!DEEPGRAM_API_KEY) {
    throw new Error('Deepgram API key is not configured (EXPO_PUBLIC_DEEPGRAM_API_KEY).');
  }

  const response = await fetch(fileUri);
  const audioBlob = await response.blob();
  const contentType = audioBlob.type || CONTENT_TYPE_FALLBACK;

  console.log('[deepgram] recorded blob', { uri: fileUri, size: audioBlob.size, blobType: audioBlob.type, sentAs: contentType });

  const dgResponse = await fetch(DEEPGRAM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      'Content-Type': contentType,
    },
    body: audioBlob,
  });

  if (!dgResponse.ok) {
    const errText = await dgResponse.text().catch(() => '');
    console.log('[deepgram] request FAILED', dgResponse.status, errText);
    throw new Error(`Deepgram request failed (${dgResponse.status}): ${errText}`);
  }

  const data = await dgResponse.json();
  const transcript =
    data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';
  const confidence = data?.results?.channels?.[0]?.alternatives?.[0]?.confidence;

  console.log('[deepgram] transcript:', JSON.stringify(transcript), 'confidence:', confidence);
  if (!transcript) {
    console.log('[deepgram] EMPTY transcript — full response:', JSON.stringify(data));
  }

  return transcript;
}
