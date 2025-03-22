import { NextResponse } from 'next/server';
import { getPlayerTimeOnIceStats } from '@/services/nhlService';

export async function GET(
  _request: Request,
  { params }: { params: { id: string; gameId: string } }
) {
  const playerId = parseInt(params.id, 10);
  const gameId = params.gameId;

  console.log(
    `API endpoint: Fetching time on ice for player ${playerId} in game ${gameId}`
  );

  try {
    const timeOnIceStats = await getPlayerTimeOnIceStats(gameId, playerId);
    console.log(
      `Successfully retrieved time on ice stats for player ${playerId}`
    );
    return NextResponse.json(timeOnIceStats);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(
      `Error fetching time on ice stats for player ${playerId} in game ${gameId}:`,
      error
    );

    // Determine the appropriate status code based on the error
    let statusCode = 500;
    if (
      errorMessage.includes('not found') ||
      errorMessage.includes('not available')
    ) {
      statusCode = 404;
    }

    return NextResponse.json(
      { error: `Failed to fetch time on ice stats: ${errorMessage}` },
      { status: statusCode }
    );
  }
}
