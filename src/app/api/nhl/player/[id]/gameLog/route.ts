import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSeason } from '@/utils/nhlSeasons';

export const dynamic = 'force-dynamic';

/**
 * Endpoint to get a player's game log with time on ice data
 * @route GET /api/nhl/player/[id]/gameLog
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '10';
    const gameType = searchParams.get('gameType') || '2'; // Default to regular season (2), playoffs is (3)
    const season = searchParams.get('season') || getCurrentSeason();

    console.log(
      `Fetching game log for player ${playerId} with limit ${limit}, gameType ${gameType}, season ${season}`
    );

    // Fetch the player details first to get their name
    const playerResponse = await fetch(
      `https://api-web.nhle.com/v1/player/${playerId}/landing`
    );

    if (!playerResponse.ok) {
      console.error(`Error fetching player info: ${playerResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch player info' },
        { status: 500 }
      );
    }

    const playerData = await playerResponse.json();

    // Now fetch the player's game log
    const gameLogResponse = await fetch(
      `https://api-web.nhle.com/v1/player/${playerId}/game-log/${season}/${gameType}`
    );

    if (!gameLogResponse.ok) {
      console.error(`Error fetching game log: ${gameLogResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch game log data' },
        { status: 500 }
      );
    }

    const gameLogData = await gameLogResponse.json();

    // Debug the first game to see actual field names
    if (gameLogData.gameLog && gameLogData.gameLog.length > 0) {
      console.log(
        'First game raw data sample:',
        JSON.stringify(gameLogData.gameLog[0], null, 2)
      );
    } else {
      console.warn('No game log data found for player', playerId);
    }

    // Process the game log to extract the data we need
    const games = (gameLogData.gameLog || [])
      .filter((game: any) => game.gameDate) // Ensure we have a valid game
      .map((game: any) => {
        // Normalize the game object to handle case-insensitive field names
        const normalizedGame: Record<string, any> = {};
        Object.entries(game).forEach(([key, value]) => {
          normalizedGame[key.toLowerCase()] = value;
        });

        // Format opponent team
        const isHome =
          normalizedGame.homeroad === 'H' ||
          normalizedGame.homeroadcode === 'H';
        const opponent = normalizedGame.opponentabbrev || 'Unknown';

        // Get time on ice values with fallbacks for different field naming conventions
        const timeOnIce =
          normalizedGame.timeonice || normalizedGame.toi || '0:00';
        const evenTimeOnIce =
          normalizedGame.eventimeonice ||
          normalizedGame.evenstrengththoi ||
          '0:00';
        const powerPlayTimeOnIce =
          normalizedGame.powerplaytimeonice ||
          normalizedGame.powerplaytoi ||
          '0:00';
        const shorthandedTimeOnIce =
          normalizedGame.shorthandedtimeonice ||
          normalizedGame.shorthandedtoi ||
          '0:00';

        return {
          gameId: (normalizedGame.gameid || '').toString(),
          gameDate: normalizedGame.gamedate,
          opponent: `${isHome ? 'vs' : '@'} ${opponent}`,
          timeOnIce,
          evenTimeOnIce,
          powerPlayTimeOnIce,
          shorthandedTimeOnIce,
          shifts: normalizedGame.shifts || 0,
        };
      })
      .slice(0, parseInt(limit)); // Limit the results

    console.log(`Returning ${games.length} processed games with TOI data`);

    // Log the first processed game for debugging
    if (games.length > 0) {
      console.log('First processed game:', games[0]);
    }

    return NextResponse.json({
      player: {
        id: playerId,
        name: `${playerData.firstName.default} ${playerData.lastName.default}`,
      },
      games,
      gameTypeId: parseInt(gameType),
    });
  } catch (error) {
    console.error('Error fetching player game log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player game log' },
      { status: 500 }
    );
  }
}
