import { NextRequest, NextResponse } from 'next/server';
import { getTeamRoster } from '@/services/nhlService';

export async function GET(
  request: NextRequest,
  { params }: { params: { team: string } }
) {
  const team = params.team;
  const { searchParams } = new URL(request.url);
  const season = searchParams.get('season') || '20242025';

  try {
    const rosterData = await getTeamRoster(team, season);
    return NextResponse.json(rosterData);
  } catch (error) {
    console.error(`Error fetching roster for team ${team}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch roster for team ${team}` },
      { status: 500 }
    );
  }
}
