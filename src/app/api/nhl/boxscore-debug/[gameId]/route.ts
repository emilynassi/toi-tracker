import { NextResponse } from 'next/server';
import { getGameBoxscore } from '@/services/nhlService';

export async function GET(
  _request: Request,
  { params }: { params: { gameId: string } }
) {
  const gameId = params.gameId;

  try {
    console.log(`Fetching boxscore for game ${gameId}...`);
    const boxscoreData = await getGameBoxscore(gameId);
    console.log(`Successfully retrieved boxscore for game ${gameId}`);

    // Check if we have the newer playerByGameStats structure or the traditional players structure
    let homeTeamPlayerIds: any[] = [];
    let awayTeamPlayerIds: any[] = [];
    let homeTeamName = '';
    let awayTeamName = '';

    // Get team names
    homeTeamName = boxscoreData.homeTeam.name.default;
    awayTeamName = boxscoreData.awayTeam.name.default;

    // First try the traditional players structure
    if (boxscoreData.homeTeam.players && boxscoreData.awayTeam.players) {
      console.log('Using traditional players structure for debug endpoint');

      const homePlayers = boxscoreData.homeTeam.players;
      homeTeamPlayerIds = Object.keys(homePlayers).map((key) => {
        const player = homePlayers[key];
        return {
          key,
          id: player.playerId,
          name: player.name?.default || 'Unknown',
          number: player.sweaterNumber,
        };
      });

      const awayPlayers = boxscoreData.awayTeam.players;
      awayTeamPlayerIds = Object.keys(awayPlayers).map((key) => {
        const player = awayPlayers[key];
        return {
          key,
          id: player.playerId,
          name: player.name?.default || 'Unknown',
          number: player.sweaterNumber,
        };
      });
    }
    // If traditional structure not available, try the newer playerByGameStats structure
    else if (boxscoreData.playerByGameStats) {
      console.log('Using playerByGameStats structure for debug endpoint');

      // Process home team
      const homeTeamPlayers = [
        ...(boxscoreData.playerByGameStats.homeTeam?.forwards || []),
        ...(boxscoreData.playerByGameStats.homeTeam?.defense || []),
        ...(boxscoreData.playerByGameStats.homeTeam?.goalies || []),
      ];

      homeTeamPlayerIds = homeTeamPlayers.map((player) => {
        return {
          key: `ID${player.playerId}`,
          id: Number(player.playerId),
          name: player.name?.default || 'Unknown',
          number: player.sweaterNumber,
          position: player.position,
        };
      });

      // Process away team
      const awayTeamPlayers = [
        ...(boxscoreData.playerByGameStats.awayTeam?.forwards || []),
        ...(boxscoreData.playerByGameStats.awayTeam?.defense || []),
        ...(boxscoreData.playerByGameStats.awayTeam?.goalies || []),
      ];

      awayTeamPlayerIds = awayTeamPlayers.map((player) => {
        return {
          key: `ID${player.playerId}`,
          id: Number(player.playerId),
          name: player.name?.default || 'Unknown',
          number: player.sweaterNumber,
          position: player.position,
        };
      });
    }
    // Neither structure is available
    else {
      console.error(
        `Boxscore data for game ${gameId} is missing expected structure`
      );
      console.log(
        'Boxscore data structure:',
        JSON.stringify(Object.keys(boxscoreData), null, 2)
      );
      return NextResponse.json(
        { error: `Invalid boxscore data structure for game ${gameId}` },
        { status: 500 }
      );
    }

    // Return simplified data for easier debugging
    return NextResponse.json({
      gameId,
      dataStructure: boxscoreData.playerByGameStats
        ? 'playerByGameStats'
        : 'traditional',
      homeTeam: {
        name: homeTeamName,
        playerCount: homeTeamPlayerIds.length,
        players: homeTeamPlayerIds,
      },
      awayTeam: {
        name: awayTeamName,
        playerCount: awayTeamPlayerIds.length,
        players: awayTeamPlayerIds,
      },
    });
  } catch (error) {
    console.error(`Error fetching boxscore debug for game ${gameId}:`, error);
    return NextResponse.json(
      {
        error: `Failed to fetch boxscore debug for game ${gameId}`,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
