import { NextResponse } from 'next/server';
import { getGameBoxscore } from '@/services/nhlService';

export async function GET(
  _request: Request,
  { params }: { params: { gameId: string } }
) {
  const gameId = params.gameId;

  try {
    const boxscoreData = await getGameBoxscore(gameId);
    return NextResponse.json(boxscoreData);
  } catch (error) {
    console.error(`Error fetching boxscore for game ${gameId}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch boxscore for game ${gameId}` },
      { status: 500 }
    );
  }
}
