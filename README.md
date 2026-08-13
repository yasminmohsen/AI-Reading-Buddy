# القارئ الذكي · Smart Reader — Arabic AI Reading Buddy

Expo (React Native) POC: a child reads a page of an Arabic storybook aloud,
the recording is transcribed by Deepgram, fuzzily matched against the page
text, and the app advances on success or replays the narrator's audio on a
miss.

## Setup

```
npm install
cp .env.example .env   # fill in EXPO_PUBLIC_DEEPGRAM_API_KEY
npx expo start
```

Press `w` for web, or scan the QR code with Expo Go for a device.

## Structure

- `src/data/booksData.js` — auto-generated 1:1 mapping of page text ↔ page
  image ↔ narrator audio for each book (see file header for how cover /
  activity / blank pages were excluded per book).
- `src/screens/` — Splash, Home (library), BookReader (recording + game
  loop), Score (with the Parent/Teacher Insight card).
- `src/services/deepgram.js` — Deepgram REST transcription.
- `src/utils/arabicMatch.js` — tashkeel-insensitive fuzzy word matching.
- `assets/books/<slug>/{images,audio}` — extracted page images and
  narrator audio per book.
