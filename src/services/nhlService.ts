import {
  TeamScheduleResponse,
  RosterResponse,
  BoxscoreResponse,
  PlayerStats,
  BoxscorePlayer,
  GoalieStats,
} from '../types/nhl';

const NHL_API_BASE_URL = 'https://api-web.nhle.com/v1';

// Calculate the current season in YYYYZZZZ format (e.g., "20232024")
function getCurrentSeason(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // January is 0

  // If we're in the latter part of the year (July-December), we're in a season that ends next year
  if (month >= 7) {
    return `${year}${year + 1}`;
  } else {
    // Otherwise we're in a season that started last year (January-June)
    return `${year - 1}${year}`;
  }
}

const currentSeason = getCurrentSeason();

/**
 * Gets the schedule for a specific team for a given season
 */
export async function getTeamSchedule(
  teamAbbrev: string,
  season: string = currentSeason
): Promise<TeamScheduleResponse> {
  console.log(`Fetching schedule for ${teamAbbrev} for season ${season}`);
  const response = await fetch(
    `${NHL_API_BASE_URL}/club-schedule-season/${teamAbbrev}/${season}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch team schedule: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Gets the roster for a specific team for a given season
 */
export async function getTeamRoster(
  teamAbbrev: string,
  season: string = currentSeason
): Promise<RosterResponse> {
  const response = await fetch(
    `${NHL_API_BASE_URL}/roster/${teamAbbrev}/${season}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch team roster: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Gets the boxscore for a specific game
 */
export async function getGameBoxscore(
  gameId: string
): Promise<BoxscoreResponse> {
  console.log(`Fetching boxscore for game ${gameId} from NHL API...`);
  try {
    const response = await fetch(
      `${NHL_API_BASE_URL}/gamecenter/${gameId}/boxscore`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`NHL API error (${response.status}): ${errorText}`);

      // For specifically handling 404 errors (game not found)
      if (response.status === 404) {
        throw new Error(`Game ${gameId} not found or not available yet`);
      }

      throw new Error(`Failed to fetch game boxscore: ${response.statusText}`);
    }

    const data = await response.json();

    // Simple validation to ensure we got valid data
    if (!data || !data.homeTeam || !data.awayTeam) {
      console.error(`Received invalid boxscore data for game ${gameId}`);
      throw new Error(`Invalid boxscore data structure for game ${gameId}`);
    }

    // Check if we have the new playerByGameStats structure but are missing the traditional players structure
    if (
      data.playerByGameStats &&
      (!data.homeTeam.players || !data.awayTeam.players)
    ) {
      console.log(
        `Transforming playerByGameStats structure for game ${gameId}`
      );

      // Create a transformed structure that includes both formats
      const transformedData = {
        ...data,
        homeTeam: {
          ...data.homeTeam,
          players: {},
        },
        awayTeam: {
          ...data.awayTeam,
          players: {},
        },
      };

      // Process home team players
      if (data.playerByGameStats.homeTeam) {
        const categories = ['forwards', 'defense', 'goalies'];

        categories.forEach((category) => {
          if (data.playerByGameStats.homeTeam[category]) {
            data.playerByGameStats.homeTeam[category].forEach((player: any) => {
              const playerId = Number(player.playerId);
              transformedData.homeTeam.players[`ID${playerId}`] = {
                playerId: playerId,
                name: player.name,
                position: player.position,
                sweaterNumber: player.sweaterNumber,
                timeOnIce: player.toi || '00:00',
                evenTimeOnIce: player.evenTimeOnIce || '00:00',
                powerPlayTimeOnIce: player.powerPlayTimeOnIce || '00:00',
                shorthandedTimeOnIce: player.shorthandedTimeOnIce || '00:00',
                shifts: player.shifts || 0,
              } as PlayerStats;
            });
          }
        });
      }

      // Process away team players
      if (data.playerByGameStats.awayTeam) {
        const categories = ['forwards', 'defense', 'goalies'];

        categories.forEach((category) => {
          if (data.playerByGameStats.awayTeam[category]) {
            data.playerByGameStats.awayTeam[category].forEach((player: any) => {
              const playerId = Number(player.playerId);
              transformedData.awayTeam.players[`ID${playerId}`] = {
                playerId: playerId,
                name: player.name,
                position: player.position,
                sweaterNumber: player.sweaterNumber,
                timeOnIce: player.toi || '00:00',
                evenTimeOnIce: player.evenTimeOnIce || '00:00',
                powerPlayTimeOnIce: player.powerPlayTimeOnIce || '00:00',
                shorthandedTimeOnIce: player.shorthandedTimeOnIce || '00:00',
                shifts: player.shifts || 0,
              } as PlayerStats;
            });
          }
        });
      }

      console.log(`Successfully transformed data for game ${gameId}`);
      return transformedData as BoxscoreResponse;
    }

    return data;
  } catch (error) {
    console.error(`Error in getGameBoxscore for game ${gameId}:`, error);
    throw error; // Re-throw to let calling functions handle it
  }
}

interface PlayerTimeOnIceStats {
  playerId: number;
  name: string;
  gameId: string;
  timeOnIce: string;
  evenTimeOnIce: string;
  powerPlayTimeOnIce: string;
  shorthandedTimeOnIce: string;
  shifts: number;
}

/**
 * Gets time on ice stats for a player from a specific game
 */
export async function getPlayerTimeOnIceStats(
  gameId: string,
  playerId: number
): Promise<PlayerTimeOnIceStats> {
  console.log(`Looking for stats for player ID ${playerId} in game ${gameId}`);

  const boxscore = await getGameBoxscore(gameId);

  console.log(`Got boxscore for game ${gameId}`);

  // Check if we have the newer playerByGameStats structure
  if (boxscore.playerByGameStats) {
    console.log('Found playerByGameStats structure');

    // Search in playerByGameStats
    let playerFound: BoxscorePlayer | GoalieStats | null = null;

    // Check home team
    const homeTeamPlayers: (BoxscorePlayer | GoalieStats)[] = [
      ...(boxscore.playerByGameStats.homeTeam?.forwards || []),
      ...(boxscore.playerByGameStats.homeTeam?.defense || []),
      ...(boxscore.playerByGameStats.homeTeam?.goalies || []),
    ];

    // Check away team
    const awayTeamPlayers: (BoxscorePlayer | GoalieStats)[] = [
      ...(boxscore.playerByGameStats.awayTeam?.forwards || []),
      ...(boxscore.playerByGameStats.awayTeam?.defense || []),
      ...(boxscore.playerByGameStats.awayTeam?.goalies || []),
    ];
    // Search in home team
    playerFound =
      homeTeamPlayers.find((player) => Number(player.playerId) === playerId) ||
      null;

    // If not found in home team, search in away team
    if (!playerFound) {
      playerFound =
        awayTeamPlayers.find(
          (player) => Number(player.playerId) === playerId
        ) || null;
    }

    if (playerFound) {
      const playerName = playerFound.name.default || `Player #${playerId}`;
      console.log(
        `Found player ${playerName} with time on ice: ${playerFound.toi}`
      );

      return {
        playerId: Number(playerFound.playerId),
        name: playerName,
        gameId,
        timeOnIce: playerFound.toi || '00:00',
        evenTimeOnIce: playerFound.evenTimeOnIce || '00:00',
        powerPlayTimeOnIce: playerFound.powerPlayTimeOnIce || '00:00',
        shorthandedTimeOnIce: playerFound.shorthandedTimeOnIce || '00:00',
        shifts: playerFound.shifts || 0,
      };
    }

    // Log available player IDs to help with debugging
    console.error(
      `Player with ID ${playerId} not found in either team for game ${gameId}`
    );
    console.log('Available player IDs in home team:');
    homeTeamPlayers.forEach((player) => {
      console.log(
        `Player ID: ${player.playerId}, Name: ${player.name.default}, Position: ${player.position}`
      );
    });

    console.log('Available player IDs in away team:');
    awayTeamPlayers.forEach((player) => {
      console.log(
        `Player ID: ${player.playerId}, Name: ${player.name.default}, Position: ${player.position}`
      );
    });

    throw new Error(`Player with ID ${playerId} not found in game ${gameId}`);
  } else {
    // Original code for older API structure
    // Check both home and away teams for the player
    let playerStats: PlayerStats | null = null;

    // Try multiple approaches to find the player
    console.log('Trying original approach for older API structure');

    // Search in home team players
    if (boxscore.homeTeam?.players) {
      Object.entries(boxscore.homeTeam.players).forEach(([key, player]) => {
        const typedPlayer = player as PlayerStats;
        if (typedPlayer.playerId === playerId) {
          console.log(
            `Found player ${
              typedPlayer.name?.default || 'Unknown'
            } in home team with ID ${playerId}`
          );
          playerStats = typedPlayer;
        }
      });
    }

    // If not found in home team, search in away team
    if (!playerStats && boxscore.awayTeam?.players) {
      Object.entries(boxscore.awayTeam.players).forEach(([key, player]) => {
        const typedPlayer = player as PlayerStats;
        if (typedPlayer.playerId === playerId) {
          console.log(
            `Found player ${
              typedPlayer.name?.default || 'Unknown'
            } in away team with ID ${playerId}`
          );
          playerStats = typedPlayer;
        }
      });
    }

    if (!playerStats) {
      console.error(
        `Player with ID ${playerId} not found in either team's roster`
      );
      throw new Error(`Player with ID ${playerId} not found in game ${gameId}`);
    }

    // Now playerStats is definitely non-null
    const validPlayerStats = playerStats as PlayerStats;

    console.log(
      `Found stats for player ${validPlayerStats.name?.default || 'Unknown'}`
    );

    return {
      playerId: validPlayerStats.playerId,
      name: validPlayerStats.name?.default || `Player #${playerId}`,
      gameId,
      timeOnIce: validPlayerStats.timeOnIce || '00:00',
      evenTimeOnIce: validPlayerStats.evenTimeOnIce || '00:00',
      powerPlayTimeOnIce: validPlayerStats.powerPlayTimeOnIce || '00:00',
      shorthandedTimeOnIce: validPlayerStats.shorthandedTimeOnIce || '00:00',
      shifts: validPlayerStats.shifts || 0,
    };
  }
}
