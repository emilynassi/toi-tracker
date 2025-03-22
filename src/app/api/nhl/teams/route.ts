import { NextResponse } from 'next/server';

// List of NHL team abbreviations
const NHL_TEAMS = [
  { id: 1, abbrev: 'NJD', name: 'New Jersey Devils' },
  { id: 2, abbrev: 'NYI', name: 'New York Islanders' },
  { id: 3, abbrev: 'NYR', name: 'New York Rangers' },
  { id: 4, abbrev: 'PHI', name: 'Philadelphia Flyers' },
  { id: 5, abbrev: 'PIT', name: 'Pittsburgh Penguins' },
  { id: 6, abbrev: 'BOS', name: 'Boston Bruins' },
  { id: 7, abbrev: 'BUF', name: 'Buffalo Sabres' },
  { id: 8, abbrev: 'MTL', name: 'Montreal Canadiens' },
  { id: 9, abbrev: 'OTT', name: 'Ottawa Senators' },
  { id: 10, abbrev: 'TOR', name: 'Toronto Maple Leafs' },
  { id: 12, abbrev: 'CAR', name: 'Carolina Hurricanes' },
  { id: 13, abbrev: 'FLA', name: 'Florida Panthers' },
  { id: 14, abbrev: 'TBL', name: 'Tampa Bay Lightning' },
  { id: 15, abbrev: 'WSH', name: 'Washington Capitals' },
  { id: 16, abbrev: 'CHI', name: 'Chicago Blackhawks' },
  { id: 17, abbrev: 'DET', name: 'Detroit Red Wings' },
  { id: 18, abbrev: 'NSH', name: 'Nashville Predators' },
  { id: 19, abbrev: 'STL', name: 'St. Louis Blues' },
  { id: 20, abbrev: 'CGY', name: 'Calgary Flames' },
  { id: 21, abbrev: 'COL', name: 'Colorado Avalanche' },
  { id: 22, abbrev: 'EDM', name: 'Edmonton Oilers' },
  { id: 23, abbrev: 'VAN', name: 'Vancouver Canucks' },
  { id: 24, abbrev: 'ANA', name: 'Anaheim Ducks' },
  { id: 25, abbrev: 'DAL', name: 'Dallas Stars' },
  { id: 26, abbrev: 'LAK', name: 'Los Angeles Kings' },
  { id: 28, abbrev: 'SJS', name: 'San Jose Sharks' },
  { id: 29, abbrev: 'CBJ', name: 'Columbus Blue Jackets' },
  { id: 30, abbrev: 'MIN', name: 'Minnesota Wild' },
  { id: 52, abbrev: 'WPG', name: 'Winnipeg Jets' },
  { id: 53, abbrev: 'ARI', name: 'Arizona Coyotes' },
  { id: 54, abbrev: 'VGK', name: 'Vegas Golden Knights' },
  { id: 55, abbrev: 'SEA', name: 'Seattle Kraken' },
];

export async function GET() {
  try {
    return NextResponse.json({ teams: NHL_TEAMS });
  } catch (error) {
    console.error('Error fetching NHL teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NHL teams' },
      { status: 500 }
    );
  }
}
