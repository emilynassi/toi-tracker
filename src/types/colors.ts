// src/constants/nhlColors.ts

export type TeamColors = {
  primary: string;
  secondary: string;
  tertiary?: string;
  neoPrimary: string; // Neobrutalist version of primary
  neoSecondary: string; // Neobrutalist version of secondary
  neoTertiary?: string; // Neobrutalist version of tertiary (if available)
  darkText: boolean; // Whether to use dark text on this team's colors
};

export type NHLTeamColors = {
  [key: string]: TeamColors;
};

// Function to "neobrutalize" a color - making it more vibrant for the style
const neobrutalize = (hex: string): string => {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Increase saturation and brightness for neobrutalism
  const hsl = rgbToHsl(r, g, b);
  hsl[1] = Math.min(hsl[1] * 1.2, 1); // Increase saturation by 20%

  // If it's too dark, brighten it more for neobrutalism
  if (hsl[2] < 0.5) {
    hsl[2] = Math.min(hsl[2] * 1.3 + 0.1, 0.9);
  }

  const [r2, g2, b2] = hslToRgb(hsl[0], hsl[1], hsl[2]);

  // Convert back to hex
  return (
    '#' +
    Math.round(r2).toString(16).padStart(2, '0') +
    Math.round(g2).toString(16).padStart(2, '0') +
    Math.round(b2).toString(16).padStart(2, '0')
  );
};

// Helper: RGB to HSL conversion
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, l];
}

// Helper: HSL to RGB conversion
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

// Calculate if text should be dark or light based on background color brightness
const shouldUseDarkText = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate perceived brightness (YIQ formula)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128; // Use dark text if background is bright
};

// NHL Team Colors
export const NHLColors: NHLTeamColors = {
  // Anaheim Ducks
  ANA: {
    primary: '#F47A38',
    secondary: '#B9975B',
    tertiary: '#000000',
    neoPrimary: neobrutalize('#F47A38'),
    neoSecondary: neobrutalize('#B9975B'),
    neoTertiary: '#000000',
    darkText: true,
  },

  // Arizona Coyotes
  ARI: {
    primary: '#8C2633',
    secondary: '#E2D6B5',
    tertiary: '#111111',
    neoPrimary: neobrutalize('#8C2633'),
    neoSecondary: neobrutalize('#E2D6B5'),
    neoTertiary: '#111111',
    darkText: false,
  },

  // Boston Bruins
  BOS: {
    primary: '#FFB81C',
    secondary: '#000000',
    neoPrimary: neobrutalize('#FFB81C'),
    neoSecondary: '#000000',
    darkText: true,
  },

  // Buffalo Sabres
  BUF: {
    primary: '#002654',
    secondary: '#FCB514',
    tertiary: '#ADAFAA',
    neoPrimary: neobrutalize('#002654'),
    neoSecondary: neobrutalize('#FCB514'),
    neoTertiary: neobrutalize('#ADAFAA'),
    darkText: false,
  },

  // Calgary Flames
  CGY: {
    primary: '#C8102E',
    secondary: '#F1BE48',
    tertiary: '#111111',
    neoPrimary: neobrutalize('#C8102E'),
    neoSecondary: neobrutalize('#F1BE48'),
    neoTertiary: '#111111',
    darkText: false,
  },

  // Carolina Hurricanes
  CAR: {
    primary: '#CC0000',
    secondary: '#000000',
    tertiary: '#A4A9AD',
    neoPrimary: neobrutalize('#CC0000'),
    neoSecondary: '#000000',
    neoTertiary: neobrutalize('#A4A9AD'),
    darkText: false,
  },

  // Chicago Blackhawks
  CHI: {
    primary: '#CF0A2C',
    secondary: '#000000',
    tertiary: '#FFD100',
    neoPrimary: neobrutalize('#CF0A2C'),
    neoSecondary: '#000000',
    neoTertiary: neobrutalize('#FFD100'),
    darkText: false,
  },

  // Colorado Avalanche
  COL: {
    primary: '#6F263D',
    secondary: '#236192',
    tertiary: '#A2AAAD',
    neoPrimary: neobrutalize('#6F263D'),
    neoSecondary: neobrutalize('#236192'),
    neoTertiary: neobrutalize('#A2AAAD'),
    darkText: false,
  },

  // Columbus Blue Jackets
  CBJ: {
    primary: '#002654',
    secondary: '#CE1126',
    tertiary: '#A4A9AD',
    neoPrimary: neobrutalize('#002654'),
    neoSecondary: neobrutalize('#CE1126'),
    neoTertiary: neobrutalize('#A4A9AD'),
    darkText: false,
  },

  // Dallas Stars
  DAL: {
    primary: '#006847',
    secondary: '#8F8F8C',
    tertiary: '#111111',
    neoPrimary: neobrutalize('#006847'),
    neoSecondary: neobrutalize('#8F8F8C'),
    neoTertiary: '#111111',
    darkText: false,
  },

  // Detroit Red Wings
  DET: {
    primary: '#CE1126',
    secondary: '#FFFFFF',
    neoPrimary: neobrutalize('#CE1126'),
    neoSecondary: '#FFFFFF',
    darkText: false,
  },

  // Edmonton Oilers
  EDM: {
    primary: '#041E42',
    secondary: '#FF4C00',
    neoPrimary: neobrutalize('#041E42'),
    neoSecondary: neobrutalize('#FF4C00'),
    darkText: false,
  },

  // Florida Panthers
  FLA: {
    primary: '#041E42',
    secondary: '#C8102E',
    tertiary: '#B9975B',
    neoPrimary: neobrutalize('#041E42'),
    neoSecondary: neobrutalize('#C8102E'),
    neoTertiary: neobrutalize('#B9975B'),
    darkText: false,
  },

  // Los Angeles Kings
  LAK: {
    primary: '#111111',
    secondary: '#A2AAAD',
    tertiary: '#FFFFFF',
    neoPrimary: '#333333', // Lightened for neobrutalism
    neoSecondary: neobrutalize('#A2AAAD'),
    neoTertiary: '#FFFFFF',
    darkText: false,
  },

  // Minnesota Wild
  MIN: {
    primary: '#154734',
    secondary: '#A6192E',
    tertiary: '#DDCBA4',
    neoPrimary: neobrutalize('#154734'),
    neoSecondary: neobrutalize('#A6192E'),
    neoTertiary: neobrutalize('#DDCBA4'),
    darkText: false,
  },

  // Montreal Canadiens
  MTL: {
    primary: '#AF1E2D',
    secondary: '#192168',
    tertiary: '#FFFFFF',
    neoPrimary: neobrutalize('#AF1E2D'),
    neoSecondary: neobrutalize('#192168'),
    neoTertiary: '#FFFFFF',
    darkText: false,
  },

  // Nashville Predators
  NSH: {
    primary: '#FFB81C',
    secondary: '#041E42',
    tertiary: '#FFFFFF',
    neoPrimary: neobrutalize('#FFB81C'),
    neoSecondary: neobrutalize('#041E42'),
    neoTertiary: '#FFFFFF',
    darkText: true,
  },

  // New Jersey Devils
  NJD: {
    primary: '#CE1126',
    secondary: '#000000',
    tertiary: '#FFFFFF',
    neoPrimary: neobrutalize('#CE1126'),
    neoSecondary: '#000000',
    neoTertiary: '#FFFFFF',
    darkText: false,
  },

  // New York Islanders
  NYI: {
    primary: '#00539B',
    secondary: '#F47D30',
    tertiary: '#FFFFFF',
    neoPrimary: neobrutalize('#00539B'),
    neoSecondary: neobrutalize('#F47D30'),
    neoTertiary: '#FFFFFF',
    darkText: false,
  },

  // New York Rangers
  NYR: {
    primary: '#0038A8',
    secondary: '#CE1126',
    tertiary: '#FFFFFF',
    neoPrimary: neobrutalize('#0038A8'),
    neoSecondary: neobrutalize('#CE1126'),
    neoTertiary: '#FFFFFF',
    darkText: false,
  },

  // Ottawa Senators
  OTT: {
    primary: '#E31837',
    secondary: '#C69214',
    tertiary: '#000000',
    neoPrimary: neobrutalize('#E31837'),
    neoSecondary: neobrutalize('#C69214'),
    neoTertiary: '#000000',
    darkText: false,
  },

  // Philadelphia Flyers
  PHI: {
    primary: '#F74902',
    secondary: '#000000',
    tertiary: '#FFFFFF',
    neoPrimary: neobrutalize('#F74902'),
    neoSecondary: '#000000',
    neoTertiary: '#FFFFFF',
    darkText: false,
  },

  // Pittsburgh Penguins
  PIT: {
    primary: '#000000',
    secondary: '#FCB514',
    tertiary: '#CFC493',
    neoPrimary: '#333333', // Lightened for neobrutalism
    neoSecondary: neobrutalize('#FCB514'),
    neoTertiary: neobrutalize('#CFC493'),
    darkText: false,
  },

  // San Jose Sharks
  SJS: {
    primary: '#006D75',
    secondary: '#000000',
    tertiary: '#EA7200',
    neoPrimary: neobrutalize('#006D75'),
    neoSecondary: '#000000',
    neoTertiary: neobrutalize('#EA7200'),
    darkText: false,
  },

  // Seattle Kraken
  SEA: {
    primary: '#99D9D9',
    secondary: '#001F5B',
    tertiary: '#E9072B',
    neoPrimary: neobrutalize('#99D9D9'),
    neoSecondary: neobrutalize('#001F5B'),
    neoTertiary: neobrutalize('#E9072B'),
    darkText: true,
  },

  // St. Louis Blues
  STL: {
    primary: '#002F87',
    secondary: '#FCB514',
    tertiary: '#041E42',
    neoPrimary: neobrutalize('#002F87'),
    neoSecondary: neobrutalize('#FCB514'),
    neoTertiary: neobrutalize('#041E42'),
    darkText: false,
  },

  // Tampa Bay Lightning
  TBL: {
    primary: '#002868',
    secondary: '#FFFFFF',
    tertiary: '#00205B',
    neoPrimary: neobrutalize('#002868'),
    neoSecondary: '#FFFFFF',
    neoTertiary: neobrutalize('#00205B'),
    darkText: false,
  },

  // Toronto Maple Leafs
  TOR: {
    primary: '#00205B',
    secondary: '#FFFFFF',
    neoPrimary: neobrutalize('#00205B'),
    neoSecondary: '#FFFFFF',
    darkText: false,
  },

  // Vancouver Canucks
  VAN: {
    primary: '#00205B',
    secondary: '#00843D',
    tertiary: '#041C2C',
    neoPrimary: neobrutalize('#00205B'),
    neoSecondary: neobrutalize('#00843D'),
    neoTertiary: neobrutalize('#041C2C'),
    darkText: false,
  },

  // Vegas Golden Knights
  VGK: {
    primary: '#B4975A',
    secondary: '#333F42',
    tertiary: '#C8102E',
    neoPrimary: neobrutalize('#B4975A'),
    neoSecondary: neobrutalize('#333F42'),
    neoTertiary: neobrutalize('#C8102E'),
    darkText: true,
  },

  // Washington Capitals
  WSH: {
    primary: '#C8102E',
    secondary: '#041E42',
    tertiary: '#FFFFFF',
    neoPrimary: neobrutalize('#C8102E'),
    neoSecondary: neobrutalize('#041E42'),
    neoTertiary: '#FFFFFF',
    darkText: false,
  },

  // Winnipeg Jets
  WPG: {
    primary: '#041E42',
    secondary: '#004C97',
    tertiary: '#AC162C',
    neoPrimary: neobrutalize('#041E42'),
    neoSecondary: neobrutalize('#004C97'),
    neoTertiary: neobrutalize('#AC162C'),
    darkText: false,
  },
};

// Utility function to get a team's neobrutalist colors
export const getTeamNeoColors = (teamAbbr: string): TeamColors => {
  return NHLColors[teamAbbr.toUpperCase()] || NHLColors.EDM; // Default to Oilers if not found
};

// Get a map of team abbreviations to team names
export const getTeamNames = (): { [key: string]: string } => {
  return {
    ANA: 'Anaheim Ducks',
    ARI: 'Arizona Coyotes',
    BOS: 'Boston Bruins',
    BUF: 'Buffalo Sabres',
    CGY: 'Calgary Flames',
    CAR: 'Carolina Hurricanes',
    CHI: 'Chicago Blackhawks',
    COL: 'Colorado Avalanche',
    CBJ: 'Columbus Blue Jackets',
    DAL: 'Dallas Stars',
    DET: 'Detroit Red Wings',
    EDM: 'Edmonton Oilers',
    FLA: 'Florida Panthers',
    LAK: 'Los Angeles Kings',
    MIN: 'Minnesota Wild',
    MTL: 'Montreal Canadiens',
    NSH: 'Nashville Predators',
    NJD: 'New Jersey Devils',
    NYI: 'New York Islanders',
    NYR: 'New York Rangers',
    OTT: 'Ottawa Senators',
    PHI: 'Philadelphia Flyers',
    PIT: 'Pittsburgh Penguins',
    SJS: 'San Jose Sharks',
    SEA: 'Seattle Kraken',
    STL: 'St. Louis Blues',
    TBL: 'Tampa Bay Lightning',
    TOR: 'Toronto Maple Leafs',
    VAN: 'Vancouver Canucks',
    VGK: 'Vegas Golden Knights',
    WSH: 'Washington Capitals',
    WPG: 'Winnipeg Jets',
  };
};

export default NHLColors;
