// Boxscore Types for new API format
export interface BoxscoreResponse {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  venue: {
    default: string;
  };
  startTimeUTC: string;
  easternUTCOffset: string;
  venueUTCOffset: string;
  tvBroadcasts: {
    id: number;
    market: string;
    countryCode: string;
    network: string;
  }[];
  gameState: string;
  homeTeam: BoxscoreTeam;
  awayTeam: BoxscoreTeam;
  gameVideo?: {
    threeMinRecap: string;
    condensedGame: string;
  };
  playerByGameStats?: {
    homeTeam: {
      forwards: BoxscorePlayer[];
      defense: BoxscorePlayer[];
      goalies: GoalieStats[];
    };
    awayTeam: {
      forwards: BoxscorePlayer[];
      defense: BoxscorePlayer[];
      goalies: GoalieStats[];
    };
  };
  // Legacy structure may also be present
  players?: Record<string, PlayerStats>;
}

export interface BoxscoreTeam {
  id: number;
  name: {
    default: string;
  };
  abbrev: string;
  score: number;
  sog: number;
  faceoffWinningPctg: number;
  powerPlayConversion: string;
  pim: number;
  hits: number;
  blocks: number;
  coaches?: {
    person: {
      id: number;
      fullName: string;
    };
    position: {
      code: string;
      name: string;
    };
  }[];
  scratches?: any[];
  shootout?: {
    scores: number;
    attempts: number;
  };
  players?: Record<string, PlayerStats>;
}

export interface PlayerStats {
  playerId: number;
  name?: {
    default: string;
  };
  position?: string;
  sweaterNumber?: number;
  timeOnIce: string;
  evenTimeOnIce: string;
  powerPlayTimeOnIce: string;
  shorthandedTimeOnIce: string;
  shifts: number;
}

// New types for the new box score format
export interface BoxscorePlayer {
  playerId: number;
  name: {
    default: string;
  };
  position: string;
  sweaterNumber: number;
  toi: string;
  evenTimeOnIce: string;
  powerPlayTimeOnIce: string;
  shorthandedTimeOnIce: string;
  shifts: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
  hits: number;
  blockedShots: number;
  powerPlayGoals: number;
  powerPlayPoints: number;
  shorthandedGoals: number;
  shorthandedPoints: number;
  sog: number;
  faceoffs: string;
  faceoffWinningPctg: number;
  takeaways: number;
  giveaways: number;
}

export interface GoalieStats {
  playerId: number;
  name: {
    default: string;
  };
  position: string;
  sweaterNumber: number;
  toi: string;
  evenTimeOnIce: string;
  powerPlayTimeOnIce: string;
  shorthandedTimeOnIce: string;
  shifts: number;
  saveShotsAgainst: string;
  savePctg: number;
  goaliesUsed: number;
  shotsAgainst: number;
  goalsAgainst: number;
  saves: number;
  evenStrengthShotsAgainst: number;
  evenStrengthGoalsAgainst: number;
  evenStrengthSaves: number;
  powerPlayShotsAgainst: number;
  powerPlayGoalsAgainst: number;
  powerPlaySaves: number;
  shorthandedShotsAgainst: number;
  shorthandedGoalsAgainst: number;
  shorthandedSaves: number;
}

// Team Types
export interface NHLTeam {
  id: number;
  name: string;
  abbrev: string;
  logo: string;
  darkLogo?: string;
  homeSplitSquad?: boolean;
  radioLink?: string;
  placeName: {
    default: string;
  };
  awayLoss?: number;
  awayOTL?: number;
  awayWin?: number;
  divisionAbbrev?: string;
  homeLoss?: number;
  homeOTL?: number;
  homeWin?: number;
  loss?: number;
  otLoss?: number;
  seasonId?: number;
  win?: number;
}

export interface TeamScheduleResponse {
  games: GameSchedule[];
  previousSeason: {
    seasonId: string;
  };
  currentSeason: {
    seasonId: string;
  };
  nextSeason: {
    seasonId: string;
  };
  teams: {
    id: number;
    franchiseId?: number;
    fullName: string;
    logoUrl: string;
    name?: string;
    triCode: string;
  }[];
}

export interface GameSchedule {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  venue: {
    default: string;
  };
  neutralSite: boolean;
  startTimeUTC: string;
  easternUTCOffset: string;
  venueUTCOffset: string;
  tvBroadcasts: any[];
  gameState: string;
  gameScheduleState: string;
  awayTeam: {
    id: number;
    name: {
      default: string;
    };
    abbrev: string;
    score?: number;
  };
  homeTeam: {
    id: number;
    name: {
      default: string;
    };
    abbrev: string;
    score?: number;
  };
  periodDescriptor?: {
    number: number;
    periodType: string;
  };
  gameCenterLink: string;
  ticketsLink?: string;
}

// Player Types
export interface RosterResponse {
  forwards: RosterPlayer[];
  defensemen: RosterPlayer[];
  goalies: RosterPlayer[];
}

export interface RosterPlayer {
  id: number;
  headshot: string;
  firstName: {
    default: string;
  };
  lastName: {
    default: string;
  };
  sweaterNumber: number;
  positionCode: string;
  shootsCatches: string;
  heightInInches: number;
  weightInPounds: number;
  heightInCentimeters: number;
  weightInKilograms: number;
  birthDate: string;
  birthCity: {
    default: string;
  };
  birthStateProvince?: {
    default: string;
  };
  birthCountry: {
    default: string;
  };
}

// Time on Ice Stats return type
export interface PlayerTimeOnIceStats {
  playerId: number;
  name: string;
  gameId: string;
  timeOnIce: string;
  evenTimeOnIce: string;
  powerPlayTimeOnIce: string;
  shorthandedTimeOnIce: string;
  shifts: number;
}

// Player game data for TOITracker component
export interface PlayerGameData {
  gameId: string;
  gameDate: string;
  opponent: string;
  timeOnIce: string;
  evenTimeOnIce: string;
  powerPlayTimeOnIce: string;
  shorthandedTimeOnIce: string;
  shifts: number;
}
