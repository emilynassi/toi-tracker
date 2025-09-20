import { NextRequest, NextResponse } from 'next/server';
import { getTeamSchedule } from '@/services/nhlService';
import { getCurrentSeason } from '@/utils/nhlSeasons';

interface Game {
  id: number;
  gameDate: string;
  gameState: string;
  gameType: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { team: string } }
) {
  const team = params.team;
  const { searchParams } = new URL(request.url);
  const season = searchParams.get('season') || getCurrentSeason();

  // Get limit parameter, default to all games if not provided
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  try {
    const scheduleData = await getTeamSchedule(team, season);

    // Log some info about the games array
    console.log(`Team: ${team}, Total games: ${scheduleData.games.length}`);

    // Filter to include only games with gameType 2 (regular season), 3 (playoffs), or 1 (preseason)
    const validGameTypes = [1, 2, 3];
    const validGames = scheduleData.games.filter((game: Game) =>
      validGameTypes.includes(game.gameType)
    );

    console.log(`Filtered to ${validGames.length} valid game types`);

    // Check for completed games
    const completedGames = validGames.filter(
      (game: Game) => game.gameState === 'FINAL' || game.gameState === 'OFF'
    );
    console.log(
      `Total completed games (FINAL or OFF): ${completedGames.length}`
    );

    // Sort games by date in reverse chronological order
    const sortedGames = [...completedGames].sort(
      (a: Game, b: Game) =>
        new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime()
    );

    // Apply limit if provided
    const limitedGames = limit ? sortedGames.slice(0, limit) : sortedGames;

    console.log(
      `Returning ${limitedGames.length} games ${
        limit ? `(limited to ${limit})` : ''
      }`
    );

    // Replace games array with our filtered, sorted, and possibly limited array
    scheduleData.games = limitedGames;

    return NextResponse.json(scheduleData);
  } catch (error) {
    console.error(`Error fetching schedule for team ${team}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch schedule for team ${team}` },
      { status: 500 }
    );
  }
}
