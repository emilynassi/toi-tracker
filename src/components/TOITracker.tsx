'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { getTeamNeoColors, TeamColors, getTeamNames } from '../types/colors';
import { NeoButton } from './ui/NeoButton';
import { NeoSelect } from './ui/NeoSelect';
import { PlayerGameData } from '../types/nhl';

// Define types for the props
type TOITrackerProps = {
  playerName: string;
  playerNumber?: number;
  team?: string;
  position?: string;
  games: PlayerGameData[];
  playerId?: string;
  gameLimit?: number;
  season?: string;
  singleGameData?: {
    timeOnIce: string;
    evenTimeOnIce: string;
    powerPlayTimeOnIce: string;
    shorthandedTimeOnIce: string;
    shifts: number;
  };
};

// Custom tooltip component with neobrutalist style
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-4 border-black p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <p className="font-bold">{label}</p>
        <p className="text-lg">
          <span className="font-bold">TOI:</span>{' '}
          {payload[0].payload.rawTimeOnIce}
        </p>
        {payload[0].payload.opponentAbbr && (
          <p className="text-xs">
            <span className="font-bold">Team:</span>{' '}
            {payload[0].payload.opponentAbbr}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Helper function to convert "MM:SS" to minutes as a number
const convertTimeToMinutes = (timeString: string): number => {
  if (!timeString) return 0;
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes + seconds / 60;
};

// Helper function to convert date to Eastern Time
const formatDateInEasternTime = (dateString: string): string => {
  try {
    console.log(`Processing date string: "${dateString}"`);

    // Create a date object from the input string
    const date = new Date(dateString);

    // If the date is invalid, return a placeholder
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return 'Invalid Date';
    }

    let correctedDate;

    // Check if we're dealing with a full ISO date string or just a date
    if (dateString.includes('T') || dateString.includes(':')) {
      // For ISO datetime strings, add 1 day as NHL API dates are 1 day behind
      correctedDate = new Date(date);
      correctedDate.setDate(date.getDate() + 1);
      console.log(`Added 1 day to datetime string`);
    } else {
      // For plain dates (YYYY-MM-DD), also add 1 day
      correctedDate = new Date(date);
      correctedDate.setDate(date.getDate() + 1);
      console.log(`Added 1 day to plain date`);
    }

    // Format the date
    const formattedDate = correctedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    console.log(
      `Date conversion: ${date.toLocaleDateString()} → ${formattedDate}`
    );
    return formattedDate;
  } catch (error) {
    console.error(`Error formatting date: ${error}`);
    return dateString;
  }
};

// Game type labels for the selector
const GAME_TYPES = [
  { id: 2, label: 'Regular Season' },
  { id: 3, label: 'Playoffs' },
];

export function TOITracker({
  playerName,
  playerNumber = 0,
  team = '',
  position = '',
  games = [],
  playerId,
  gameLimit = 10,
  season,
  singleGameData,
}: TOITrackerProps) {
  const [highlightedGame, setHighlightedGame] = useState<number | null>(null);
  const [gamesData, setGamesData] = useState<PlayerGameData[]>(games);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedGameType, setSelectedGameType] = useState<number>(0); // 0 for Regular Season, 1 for Playoffs
  const [rollingAverageData, setRollingAverageData] = useState<PlayerGameData[]>([]);

  // Update games data when props change
  useEffect(() => {
    setGamesData(games);
  }, [games]);

  // Function to fetch rolling average data (always last 5 games)
  const fetchRollingAverageData = async () => {
    if (!playerId) return;

    try {
      const gameType = GAME_TYPES[selectedGameType].id;
      const seasonParam = season ? `&season=${season}` : '';
      const response = await fetch(
        `/api/nhl/player/${playerId}/gameLog?gameType=${gameType}&limit=5${seasonParam}`
      );
      if (!response.ok) throw new Error('Failed to fetch rolling average data');
      const data = await response.json();
      setRollingAverageData(data.games || []);
    } catch (error) {
      console.error('Error fetching rolling average data:', error);
    }
  };

  // Function to fetch games data based on the selected game type
  const fetchGameData = async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      const gameType = GAME_TYPES[selectedGameType].id;
      const seasonParam = season ? `&season=${season}` : '';

      // Fetch both display data and rolling average data in parallel
      const [displayResponse] = await Promise.all([
        fetch(`/api/nhl/player/${playerId}/gameLog?gameType=${gameType}&limit=${gameLimit}${seasonParam}`),
        fetchRollingAverageData()
      ]);

      if (!displayResponse.ok) throw new Error('Failed to fetch data');
      const displayData = await displayResponse.json();
      setGamesData(displayData.games || []);
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when player ID, game type, game limit, or season changes
  useEffect(() => {
    if (playerId) {
      fetchGameData();
    }
  }, [playerId, selectedGameType, gameLimit, season]);

  // Log the games data for debugging
  console.log('Games data:', gamesData);

  // Get team colors based on team abbreviation (fallback to default if not provided)
  const teamAbbr = team || 'EDM'; // Default to Oilers if no team provided
  console.log('Player team:', teamAbbr);
  const teamColors: TeamColors = getTeamNeoColors(teamAbbr);

  // Fallback colors in neobrutalist style (only used if team not found)
  const fallbackColors = [
    '#FF6B6B',
    '#4ECDC4',
    '#FFE66D',
    '#1A535C',
    '#FF9F1C',
  ];

  // Color variables for use in component
  const primaryColor = teamColors.neoPrimary;
  const secondaryColor = teamColors.neoSecondary;
  const tertiaryColor = teamColors.neoTertiary || fallbackColors[0];
  const useWhiteText = !teamColors.darkText;
  const textColor = useWhiteText ? 'white' : 'black';

  // Get map of team names to abbreviations
  const teamNames = getTeamNames();
  const teamAbbreviations = Object.entries(teamNames).reduce(
    (acc, [abbr, name]) => {
      acc[name] = abbr;
      // Also add shortened versions (e.g., "Oilers" for "Edmonton Oilers")
      const shortName = name.split(' ').pop() || '';
      if (shortName !== name) {
        acc[shortName] = abbr;
      }
      return acc;
    },
    {} as Record<string, string>
  );

  // Format game data for the chart
  const chartData = gamesData.map((game) => {
    // Extract the team abbreviation from opponent
    let opponentAbbr = '';

    // Try to find the team abbreviation by matching against full team names or short names
    const opponentName = game.opponent;
    console.log(`Processing opponent: "${opponentName}"`);

    // Common patterns in NHL API data
    // Example: "@ TOR" or "vs TOR" - extract the code directly
    const directCodeMatch = opponentName.match(/(?:@|vs)\s+([A-Z]{3})/i);
    if (
      directCodeMatch &&
      directCodeMatch[1] &&
      teamNames[directCodeMatch[1].toUpperCase()]
    ) {
      opponentAbbr = directCodeMatch[1].toUpperCase();
      console.log(`  Found direct code: ${opponentAbbr}`);
    }
    // Example: "Toronto Maple Leafs" - check full team name
    else if (
      Object.entries(teamNames).some(([abbr, name]) => {
        if (name.toLowerCase() === opponentName.toLowerCase()) {
          opponentAbbr = abbr;
          return true;
        }
        return false;
      })
    ) {
      console.log(`  Matched full team name: ${opponentAbbr}`);
    }
    // Check for team name at the end: "@ Toronto" or "vs Maple Leafs"
    else {
      // Remove prefixes like "@ " or "vs "
      const cleanedName = opponentName.replace(/^(?:@|vs)\s+/i, '').trim();
      console.log(`  Cleaned name: "${cleanedName}"`);

      // Check if it matches any part of a team name
      let bestMatch = '';
      let bestMatchScore = 0;

      Object.entries(teamNames).forEach(([abbr, name]) => {
        const nameParts = name.toLowerCase().split(' ');
        const cleanedNameLower = cleanedName.toLowerCase();

        // Check if the cleaned name matches any part of the team name
        nameParts.forEach((part) => {
          if (
            part.length > 3 &&
            (cleanedNameLower.includes(part) || part.includes(cleanedNameLower))
          ) {
            const score = part.length; // Longer matches are better
            if (score > bestMatchScore) {
              bestMatchScore = score;
              bestMatch = abbr;
            }
          }
        });

        // Also check the team city/location
        if (
          name.toLowerCase().startsWith(cleanedNameLower) &&
          cleanedNameLower.length > 3
        ) {
          const score = cleanedNameLower.length + 5; // Bonus for matching the start
          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatch = abbr;
          }
        }
      });

      if (bestMatch) {
        opponentAbbr = bestMatch;
        console.log(
          `  Best match found: ${opponentAbbr} (${teamNames[opponentAbbr]}) with score ${bestMatchScore}`
        );
      }
    }

    // If still no match, try to extract a 3-letter code from the opponent name
    if (!opponentAbbr) {
      // Look for a 3-letter capitalized code in the opponent name
      const codeMatch = opponentName.match(/\b([A-Z]{3})\b/);
      if (codeMatch && codeMatch[1] && teamNames[codeMatch[1]]) {
        opponentAbbr = codeMatch[1];
        console.log(`  Extracted code from name: ${opponentAbbr}`);
      }
      // As a last resort, take the first 3 letters
      else {
        opponentAbbr = opponentName
          .replace(/^(?:@|vs)\s+/i, '')
          .substring(0, 3)
          .toUpperCase();
        console.log(`  Falling back to first 3 chars: ${opponentAbbr}`);
      }
    }

    // If still no match, default to EDM
    if (!teamNames[opponentAbbr]) {
      console.log(
        `  Could not find valid team for opponent: ${opponentName}, using EDM as fallback`
      );
      opponentAbbr = 'EDM';
    } else {
      console.log(
        `  Final team abbreviation for ${opponentName}: ${opponentAbbr} (${teamNames[opponentAbbr]})`
      );
    }

    const opponentColors = getTeamNeoColors(opponentAbbr);

    return {
      game: game.opponent,
      // Store original date for debugging
      gameDate: game.gameDate,
      date: (() => {
        // Add debugging
        console.log(`Original date string: ${game.gameDate}`);

        // Convert the date to Eastern Time
        const formattedDate = formatDateInEasternTime(game.gameDate);
        console.log(`Formatted date: ${formattedDate}`);

        return formattedDate;
      })(),
      timeOnIce: convertTimeToMinutes(game.timeOnIce),
      rawTimeOnIce: game.timeOnIce,
      evenTimeOnIce: game.evenTimeOnIce,
      powerPlayTimeOnIce: game.powerPlayTimeOnIce,
      shorthandedTimeOnIce: game.shorthandedTimeOnIce,
      shifts: game.shifts,
      gameId: game.gameId,
      // Add opponent team colors and abbr for debugging
      opponentAbbr: opponentAbbr,
      opponentPrimaryColor: opponentColors.neoPrimary,
      opponentSecondaryColor: opponentColors.neoSecondary,
      opponentDarkText: opponentColors.darkText,
    };
  });

  // Calculate average TOI if we have games data
  const averageTOI =
    chartData.length > 0
      ? (
          chartData.reduce((sum, game) => sum + game.timeOnIce, 0) /
          chartData.length
        ).toFixed(1)
      : '0.0';

  // Calculate 5-game rolling average from the dedicated rolling average data
  const rollingAverage5 =
    rollingAverageData.length > 0
      ? (
          rollingAverageData
            .reduce((sum, game) => sum + convertTimeToMinutes(game.timeOnIce), 0) /
          rollingAverageData.length
        ).toFixed(1)
      : '0.0';

  // Format minutes for Y-axis ticks
  const formatYAxis = (value: number) => {
    const minutes = Math.floor(value);
    return `${minutes}:00`;
  };

  return (
    <div className="font-sans w-full">
      {/* Player Card */}
      <div
        className={`border-8 border-black bg-white p-6 mb-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-4xl font-black">{playerName}</h2>
            <div className="flex mt-2 gap-4">
              {playerNumber > 0 && (
                <span
                  className={`px-2 py-1 font-bold`}
                  style={{
                    backgroundColor: primaryColor,
                    color:
                      primaryColor === '#FFFFFF' ||
                      primaryColor.toLowerCase() === '#fff'
                        ? '#000'
                        : useWhiteText
                        ? '#fff'
                        : '#000',
                    border: '4px solid black',
                  }}
                >
                  #{playerNumber}
                </span>
              )}
              {position && (
                <span
                  className="border-4 border-black px-2 py-1 font-bold"
                  style={{
                    backgroundColor: secondaryColor,
                    color:
                      secondaryColor === '#FFFFFF' ||
                      secondaryColor.toLowerCase() === '#fff'
                        ? '#000'
                        : useWhiteText
                        ? '#fff'
                        : '#000',
                  }}
                >
                  {position}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <div
              className="p-4 border-4 border-black transform rotate-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
              style={{
                backgroundColor: tertiaryColor || secondaryColor,
                color:
                  tertiaryColor === '#FFFFFF' ||
                  tertiaryColor.toLowerCase() === '#fff'
                    ? '#000'
                    : useWhiteText
                    ? '#fff'
                    : '#000',
              }}
            >
              <p className="text-3xl font-black">{averageTOI}</p>
              <p className="text-sm font-bold">AVG MINUTES</p>
            </div>
            <div
              className="p-4 border-4 border-black transform -rotate-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
              style={{
                backgroundColor: primaryColor,
                color:
                  primaryColor === '#FFFFFF' ||
                  primaryColor.toLowerCase() === '#fff'
                    ? '#000'
                    : useWhiteText
                    ? '#fff'
                    : '#000',
              }}
            >
              <p className="text-3xl font-black">{rollingAverage5}</p>
              <p className="text-sm font-bold">LAST 5 AVG</p>
            </div>
          </div>
        </div>

        {/* Game Type Selector */}
        {playerId && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <div className="font-bold border-b-4 border-black">
                GAME TYPE:
              </div>
              <div className="flex gap-3">
                {GAME_TYPES.map((type, index) => {
                  const isActive = selectedGameType === index;
                  return (
                    <div
                      key={type.id}
                      className="relative"
                    >
                      <NeoButton
                        onClick={() => setSelectedGameType(index)}
                        primaryColor={isActive ? primaryColor : 'white'}
                        textColor={
                          isActive
                            ? useWhiteText
                              ? 'white'
                              : 'black'
                            : 'black'
                        }
                        size="sm"
                        className={`${
                          isActive
                            ? 'transform -rotate-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                            : 'opacity-90 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]'
                        }`}
                      >
                        {type.label}
                        {isActive && <span className="ml-1">★</span>}
                      </NeoButton>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chart Section */}
        {!loading && chartData.length > 0 ? (
          <div className="h-72 w-full border-4 border-black p-4 bg-white mb-6">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={chartData}
                onMouseMove={(data: any) => {
                  if (data && data.activeTooltipIndex !== undefined) {
                    setHighlightedGame(data.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setHighlightedGame(null)}
                margin={{ top: 10, right: 10, left: 30, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ccc"
                />
                <XAxis
                  dataKey="game"
                  stroke="#000"
                  strokeWidth={2}
                  tick={{ fontSize: 14, fontWeight: 'bold' }}
                />
                <YAxis
                  stroke="#000"
                  strokeWidth={2}
                  tick={{ fontSize: 14, fontWeight: 'bold' }}
                  tickFormatter={formatYAxis}
                  label={{
                    value: 'Minutes',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar
                  dataKey="timeOnIce"
                  stroke="#000"
                  strokeWidth={3}
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        highlightedGame === index
                          ? entry.opponentPrimaryColor
                          : primaryColor
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : !loading && singleGameData ? (
          <div className="mb-6 p-4 border-4 border-black bg-white">
            <p className="text-xl font-bold mb-4">Single Game Data</p>
          </div>
        ) : !loading ? (
          <div className="mb-6 p-4 border-4 border-black bg-white">
            <p className="text-xl font-bold">No game data available</p>
          </div>
        ) : (
          <div className="h-72 w-full border-4 border-black p-4 bg-white mb-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-xl font-black">LOADING GAMES...</div>
          </div>
        )}

        {/* Game List or Single Game Detail */}
        {!loading && chartData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chartData.map((game, index) => {
              // Use opponent team colors when highlighted
              const cardColor =
                highlightedGame === index ? game.opponentPrimaryColor : 'white';
              const cardTextColor =
                highlightedGame === index && !game.opponentDarkText
                  ? '#fff'
                  : '#000';

              return (
                <div
                  key={index}
                  className={`border-4 border-black p-4 transform ${
                    highlightedGame === index
                      ? '-rotate-1 transition-all duration-200'
                      : ''
                  }`}
                  style={{
                    backgroundColor: cardColor,
                    // Always use black text when background is white
                    color:
                      cardColor === 'white' ||
                      cardColor === '#FFFFFF' ||
                      cardColor.toLowerCase() === '#fff'
                        ? '#000'
                        : cardTextColor,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="font-black text-xl">{game.game}</div>
                  <div className="text-sm font-bold">{game.date}</div>
                  <div className="text-3xl font-black mt-2">
                    {game.rawTimeOnIce} <span className="text-base">min</span>
                  </div>
                  <div className="text-xs mt-1">
                    <span className="font-bold">Shifts:</span> {game.shifts}
                  </div>
                </div>
              );
            })}
          </div>
        ) : !loading && singleGameData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-4 border-black p-4 bg-white">
              <h3 className="font-bold mb-2">Time on Ice</h3>
              <p className="text-3xl font-black">{singleGameData.timeOnIce}</p>
            </div>
            <div className="border-4 border-black p-4 bg-white">
              <h3 className="font-bold mb-2">Shifts</h3>
              <p className="text-3xl font-black">{singleGameData.shifts}</p>
            </div>
            <div className="border-4 border-black p-4 bg-white">
              <h3 className="font-bold mb-2">Even Strength</h3>
              <p className="text-3xl font-black">
                {singleGameData.evenTimeOnIce}
              </p>
            </div>
            <div className="border-4 border-black p-4 bg-white">
              <h3 className="font-bold mb-2">Power Play</h3>
              <p className="text-3xl font-black">
                {singleGameData.powerPlayTimeOnIce}
              </p>
            </div>
            <div className="border-4 border-black p-4 bg-white md:col-span-2">
              <h3 className="font-bold mb-2">Shorthanded</h3>
              <p className="text-3xl font-black">
                {singleGameData.shorthandedTimeOnIce}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Controls (WIP) */}
      {/* <div className="flex gap-4 justify-center">
        <NeoButton>NEW PLAYER</NeoButton>
        <NeoButton>MORE STATS</NeoButton>
      </div> */}
    </div>
  );
}
