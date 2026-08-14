// Design tokens mirrored 1:1 from the "Smart Reader" Figma prototype
// (claude.ai/design project e2fa8389-1315-44ea-8aa4-dec70289cf7e).

export const colors = {
  bg: '#F1EBFB',
  bgSoft: '#F7F3FE',
  primary: '#6A3DD6',
  primaryDark: '#5A2FC4',
  primaryDarker: '#4A2A9A',
  textDark: '#3C2470',
  textMuted: 'rgba(60,36,112,0.55)',
  textMuted70: 'rgba(60,36,112,0.7)',
  textMuted50: 'rgba(60,36,112,0.5)',
  textMuted38: 'rgba(60,36,112,0.38)',
  chipBg: '#EDE3FF',
  chipBgSoft: '#F2EDFB',
  chipBgHover: '#E7DEF8',
  success: '#3FB27F',
  successDark: '#2E8F65',
  successDarkHover: '#359C6E',
  successBg: '#E6F7EF',
  error: '#E0453C',
  errorBg: '#FDECEA',
  gold: '#F5B33C',
  goldLight: '#FFD37A',
  white: '#FFFFFF',
  pageBg: '#FFFDF8',
  cardShadow: 'rgba(60,36,112,0.13)',
};

// Palette for the "لبيبو" (Siraj) companion character — mirrored from the
// "Reader Buddy" companion prototype (claude.ai/design).
colors.siraj = {
  glowInner: 'rgba(90,215,255,0.55)',
  glowOuter: 'rgba(120,110,250,0.28)',
  glowEdge: 'rgba(120,110,250,0)',
  bodyGradient: ['#8DE9FF', '#63B6F7', '#8F74F2', '#A86CF0'],
  bodyGradientLocations: [0, 0.32, 0.68, 1],
  bodyBorder: 'rgba(255,255,255,0.55)',
  continent: 'rgba(126,247,211,0.75)',
  highlight: 'rgba(255,255,255,0.6)',
  eye: '#1B0F3D',
  mouth: '#20103F',
  tongue: '#FF8095',
  blush: 'rgba(110,200,255,0.75)',
  ring: 'rgba(126,247,211,0.7)',
  sparkleGold: '#FFE17A',
  sparkleTeal: '#7EF7D3',
  sparklePink: '#FFB6E6',
  zzz: '#BFE9FF',
};

export const fonts = {
  display: 'BalooBhaijaan2', // headings / numerals / titles
  body: 'Cairo', // body copy
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
};

export const spacing = (n) => n * 4;

export const shadow = {
  card: {
    shadowColor: '#3C2470',
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  modal: {
    shadowColor: '#1E0A46',
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -10 },
    elevation: 10,
  },
  mic: {
    shadowColor: '#6A3DD6',
    shadowOpacity: 0.38,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};
