'use client';

import { TOITracker } from '@/components/TOITracker';

// Sample player data for testing
const samplePlayerData = {
  name: 'Connor McDavid',
  number: 97,
  position: 'C',
  team: 'EDM',
  games: [
    {
      gameId: '2023020123',
      gameDate: '2023-10-15',
      opponent: 'vs CGY',
      timeOnIce: '22:45',
      evenTimeOnIce: '18:30',
      powerPlayTimeOnIce: '3:45',
      shorthandedTimeOnIce: '0:30',
      shifts: 28,
    },
    {
      gameId: '2023020124',
      gameDate: '2023-10-17',
      opponent: '@ VAN',
      timeOnIce: '24:12',
      evenTimeOnIce: '19:22',
      powerPlayTimeOnIce: '4:20',
      shorthandedTimeOnIce: '0:30',
      shifts: 32,
    },
    {
      gameId: '2023020125',
      gameDate: '2023-10-19',
      opponent: 'vs SEA',
      timeOnIce: '25:33',
      evenTimeOnIce: '20:13',
      powerPlayTimeOnIce: '5:00',
      shorthandedTimeOnIce: '0:20',
      shifts: 30,
    },
    {
      gameId: '2023020126',
      gameDate: '2023-10-21',
      opponent: 'vs STL',
      timeOnIce: '21:15',
      evenTimeOnIce: '17:45',
      powerPlayTimeOnIce: '3:15',
      shorthandedTimeOnIce: '0:15',
      shifts: 26,
    },
    {
      gameId: '2023020127',
      gameDate: '2023-10-23',
      opponent: '@ WPG',
      timeOnIce: '23:05',
      evenTimeOnIce: '18:35',
      powerPlayTimeOnIce: '4:00',
      shorthandedTimeOnIce: '0:30',
      shifts: 29,
    },
  ],
};

// Sample single game data
const sampleSingleGameData = {
  timeOnIce: '23:42',
  evenTimeOnIce: '19:12',
  powerPlayTimeOnIce: '4:10',
  shorthandedTimeOnIce: '0:20',
  shifts: 31,
};

export default function TOITestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">TOITracker Component Test</h1>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Multiple Games View:</h2>
        <TOITracker
          playerName={samplePlayerData.name}
          playerNumber={samplePlayerData.number}
          position={samplePlayerData.position}
          team={samplePlayerData.team}
          games={samplePlayerData.games}
        />
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Single Game View:</h2>
        <TOITracker
          playerName={samplePlayerData.name}
          playerNumber={samplePlayerData.number}
          position={samplePlayerData.position}
          team={samplePlayerData.team}
          games={[]}
          singleGameData={sampleSingleGameData}
        />
      </div>
    </div>
  );
}
