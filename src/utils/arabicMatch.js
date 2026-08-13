// Normalizes and fuzzy-matches a Deepgram Arabic transcript against a page's
// reference text: strips tashkeel/punctuation, then blends word-overlap with
// Levenshtein-based similarity so partial mispronunciations still score fairly.

// Combining diacritic marks only: ً-ٟ (fathatan/dammatan/kasratan,
// fatha/damma/kasra, shadda, sukoon, etc.), ٰ (dagger alef), ۖ-ۭ
// (Quranic annotation signs). Must NOT include base letters (ء-ي) —
// an earlier version of this range accidentally swallowed the letters too,
// so every reference word normalized to an empty string and matching always
// failed regardless of how the child actually pronounced it.
const TASHKEEL = /[ً-ٰٟۖ-ۭ]/g;
const PUNCTUATION = /[.,:;!?"'()\[\]{}«»\-–—_/\\|*#@$%^&+=~`،؛؟٪-٭]/g;
const DIACRITIC_ALEF = { 'آ': 'ا', 'أ': 'ا', 'إ': 'ا', 'ٱ': 'ا' };

export function normalizeArabic(str = '') {
  return str
    .replace(TASHKEEL, '')
    .replace(PUNCTUATION, ' ')
    .replace(/ـ/g, '') // tatweel
    .split('')
    .map((ch) => DIACRITIC_ALEF[ch] || ch)
    .join('')
    .replace(/ة/g, 'ه') // ة -> ه (loose match)
    .replace(/ى/g, 'ي') // ى -> ي
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function normalizeWords(str = '') {
  return normalizeArabic(str).split(' ').filter(Boolean);
}

// Splits raw (non-normalized) text into words, preserving tashkeel, aligned
// 1:1 by index with normalizeWords()'s output for the same string (splitting
// never merges/drops words, it only cleans characters within each word).
function rawWords(str = '') {
  return str.trim().split(/\s+/).filter(Boolean);
}

// Groups a raw word into {base, diacritics} units, one per base letter, so a
// reference word and a matched heard word (same base letters, guaranteed by
// the caller) can be compared position-by-position for their diacritics.
function tokenizeWithDiacritics(word) {
  const tokens = [];
  for (const ch of word) {
    if (TASHKEEL.test(ch)) {
      if (tokens.length) tokens[tokens.length - 1].diacritics += ch;
    } else if (!PUNCTUATION.test(ch)) {
      tokens.push({ base: ch, diacritics: '' });
    }
  }
  return tokens;
}

/**
 * Compares tashkeel between a reference word and the matched heard word.
 * Only flags a position where Deepgram actually surfaced a diacritic that
 * disagrees with the reference — a heard word with NO diacritics at a given
 * letter is not treated as wrong, since Deepgram's Arabic model surfaces
 * tashkeel inconsistently (often not at all) rather than deliberately
 * omitting it, and this must never fail a child for the model's silence.
 */
function compareWordTashkeel(refRawWord, heardRawWord) {
  const refTokens = tokenizeWithDiacritics(refRawWord);
  const heardTokens = tokenizeWithDiacritics(heardRawWord);
  if (refTokens.length !== heardTokens.length) return [];
  const mismatches = [];
  refTokens.forEach((r, i) => {
    const h = heardTokens[i];
    if (!h.diacritics) return; // ASR surfaced nothing here — not evidence of a mistake
    if (h.diacritics !== r.diacritics) {
      mismatches.push({ base: r.base, expected: r.diacritics, heard: h.diacritics });
    }
  });
  return mismatches;
}

function levenshtein(a, b) {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  let prev = Array.from({ length: bl + 1 }, (_, i) => i);
  for (let i = 1; i <= al; i++) {
    const cur = [i];
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[bl];
}

function wordSimilarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Compares a spoken transcript against the reference page text.
 * Returns { score (0-1), matchedWords: bool[], wrongWords: string[] } aligned
 * to the reference word order, so the UI can highlight exactly what to retry.
 *
 * `tashkeelNotes` is a separate, non-punitive signal: for words that already
 * matched on their base letters, if Deepgram's transcript happened to carry
 * diacritics that disagree with the reference, it's surfaced here as
 * enrichment feedback only — it never affects `score`/pass-fail, since
 * Deepgram surfaces tashkeel too inconsistently to grade on (see
 * arabicMatch usage notes / product decision).
 */
export function matchTranscript(referenceText, transcript, { wordThreshold = 0.72 } = {}) {
  const refWords = normalizeWords(referenceText);
  const heardWords = normalizeWords(transcript);
  const refWordsRaw = rawWords(referenceText);
  const heardWordsRaw = rawWords(transcript);

  if (refWords.length === 0) {
    return { score: 0, matchedWords: [], wrongWords: [], wrongIndices: [], tashkeelNotes: [] };
  }

  const heardAvailable = heardWords.map(() => true);
  const matchedWords = [];
  const wrongIndices = [];
  const tashkeelNotes = [];

  refWords.forEach((refWord, idx) => {
    let bestIdx = -1;
    let bestScore = 0;
    heardWords.forEach((heardWord, hIdx) => {
      if (!heardAvailable[hIdx]) return;
      const sim = refWord === heardWord ? 1 : wordSimilarity(refWord, heardWord);
      if (sim > bestScore) {
        bestScore = sim;
        bestIdx = hIdx;
      }
    });
    const isMatch = bestScore >= wordThreshold;
    if (isMatch && bestIdx !== -1) {
      heardAvailable[bestIdx] = false;
      const mismatches = compareWordTashkeel(refWordsRaw[idx], heardWordsRaw[bestIdx]);
      if (mismatches.length > 0) {
        tashkeelNotes.push({ word: refWordsRaw[idx], mismatches });
      }
    } else {
      wrongIndices.push(idx);
    }
    matchedWords.push(isMatch);
  });

  const score = matchedWords.filter(Boolean).length / refWords.length;
  const wrongWords = wrongIndices.map((i) => refWords[i]);

  return { score, matchedWords, wrongWords, wrongIndices, refWords, tashkeelNotes };
}

export function isPassingScore(score, { min = 0.7 } = {}) {
  return score >= min;
}
