'use client';

import { useState, useEffect } from 'react';

type Team = {
  id: number;
  abbrev: string;
  name: string;
};

type Player = {
  id: number;
  firstName: {
    default: string;
  };
  lastName: {
    default: string;
  };
  sweaterNumber: number;
  positionCode: string;
  headshot: string;
};

type Game = {
  id: number;
  gameDate: string;
  gameState: string;
  awayTeam: {
    abbrev: string;
    name?: {
      default: string;
    };
  };
  homeTeam: {
    abbrev: string;
    name?: {
      default: string;
    };
  };
};

type PlayerTimeOnIce = {
  playerId: number;
  name: string;
  gameId: string;
  timeOnIce: string;
  evenTimeOnIce: string;
  powerPlayTimeOnIce: string;
  shorthandedTimeOnIce: string;
  shifts: number;
};

export default function NHLStats() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [timeOnIce, setTimeOnIce] = useState<PlayerTimeOnIce | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameLimit, setGameLimit] = useState<number>(10);

  // Fetch teams on component mount
  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true);
        const response = await fetch('/api/nhl/teams');
        const data = await response.json();
        setTeams(data.teams);
      } catch (err) {
        setError('Error fetching teams');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, []);

  // Fetch roster when a team is selected
  useEffect(() => {
    if (!selectedTeam) return;

    async function fetchRoster() {
      try {
        setLoading(true);
        setPlayers([]);
        setSelectedPlayer(null);
        setGames([]);
        setSelectedGame(null);
        setTimeOnIce(null);

        const response = await fetch(`/api/nhl/roster/${selectedTeam}`);
        const data = await response.json();

        // Combine all player types
        const allPlayers = [
          ...data.forwards,
          ...data.defensemen,
          ...data.goalies,
        ];

        setPlayers(allPlayers);
      } catch (err) {
        setError(`Error fetching roster for team ${selectedTeam}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoster();
  }, [selectedTeam]);

  // Fetch schedule when a team is selected
  useEffect(() => {
    if (!selectedTeam) return;

    async function fetchSchedule() {
      try {
        setLoading(true);
        setGames([]);
        setSelectedGame(null);
        setTimeOnIce(null);

        const response = await fetch(
          `/api/nhl/schedule/${selectedTeam}?limit=${gameLimit}`
        );
        const data = await response.json();

        console.log(`Frontend received ${data.games.length} games`);

        // Only show completed games (FINAL or OFF) - already sorted and limited by the API
        const completedGames = data.games;

        setGames(completedGames);
      } catch (err) {
        setError(`Error fetching schedule for team ${selectedTeam}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, [selectedTeam, gameLimit]);

  // Fetch time on ice when a player and game are selected
  useEffect(() => {
    if (!selectedPlayer || !selectedGame) return;

    async function fetchTimeOnIce() {
      try {
        setLoading(true);
        setTimeOnIce(null);
        setError(null); // Clear any previous errors

        console.log(
          `Fetching time on ice for player ID: ${selectedPlayer} in game: ${selectedGame}`
        );

        // Find selected player name for better logging
        const selectedPlayerData = players.find((p) => p.id === selectedPlayer);
        if (selectedPlayerData) {
          console.log(
            `Selected player: ${selectedPlayerData.firstName.default} ${selectedPlayerData.lastName.default} (#${selectedPlayerData.sweaterNumber})`
          );
        }

        // Find selected game for better logging
        const selectedGameData = games.find((g) => g.id === selectedGame);
        if (selectedGameData) {
          console.log(
            `Selected game: ${new Date(
              selectedGameData.gameDate
            ).toLocaleDateString()} - ${selectedGameData.awayTeam.abbrev} @ ${
              selectedGameData.homeTeam.abbrev
            }`
          );
        }

        // First, try fetching the boxscore directly - skip the debug endpoint
        console.log(`Fetching time on ice data...`);
        try {
          const response = await fetch(
            `/api/nhl/player/${selectedPlayer}/timeOnIce/${selectedGame}`
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error (${response.status}): ${errorText}`);

            // If this is a game that doesn't have data yet, show a helpful message
            if (
              response.status === 500 &&
              errorText.includes('not found in game')
            ) {
              setError(
                `Player may not have played in this game, or game data isn't available yet.`
              );
              setLoading(false);
              return;
            }

            throw new Error(`API returned status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Received time on ice data:', data);

          setTimeOnIce(data);
        } catch (err) {
          console.error('Error fetching time on ice:', err);
          setError(
            `Error fetching time on ice for player ${selectedPlayer} in game ${selectedGame}. The player may not have played in this game or the game data may not be available yet.`
          );
        }
      } catch (err) {
        console.error('Full error:', err);
        setError(
          `Could not load player statistics. The player may not have played in this game or the game data may not be available yet.`
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTimeOnIce();
  }, [selectedPlayer, selectedGame, players, games]);

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeam(e.target.value);
  };

  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlayer(Number(e.target.value));
  };

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGame(Number(e.target.value));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGameLimit(Number(e.target.value));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">NHL Time on Ice Tracker</h1>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Team:</label>
        <select
          className="block w-full p-2 border rounded-md"
          value={selectedTeam}
          onChange={handleTeamChange}
          disabled={loading}
        >
          <option value="">Select a team</option>
          {teams.map((team) => (
            <option
              key={team.id}
              value={team.abbrev}
            >
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Games to display:</label>
          <select
            className="block w-full p-2 border rounded-md"
            value={gameLimit}
            onChange={handleLimitChange}
            disabled={loading}
          >
            <option value="5">5 games</option>
            <option value="10">10 games</option>
            <option value="20">20 games</option>
            <option value="50">50 games</option>
            <option value="100">All games</option>
          </select>
        </div>
      )}

      {players.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Player:</label>
          <select
            className="block w-full p-2 border rounded-md"
            value={selectedPlayer || ''}
            onChange={handlePlayerChange}
            disabled={loading}
          >
            <option value="">Select a player</option>
            {players.map((player) => (
              <option
                key={player.id}
                value={player.id}
              >
                {player.firstName.default} {player.lastName.default} (#
                {player.sweaterNumber}) - {player.positionCode}
              </option>
            ))}
          </select>
        </div>
      )}

      {games.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Game:</label>
          <select
            className="block w-full p-2 border rounded-md"
            value={selectedGame || ''}
            onChange={handleGameChange}
            disabled={loading}
          >
            <option value="">Select a game</option>
            {games.map((game) => (
              <option
                key={game.id}
                value={game.id}
              >
                {new Date(game.gameDate).toLocaleDateString()} -{' '}
                {game.awayTeam.abbrev} @ {game.homeTeam.abbrev}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <div className="text-center my-4">
          <p>Loading...</p>
        </div>
      )}

      {timeOnIce && (
        <div className="mt-6 bg-white p-4 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-3">
            {timeOnIce.name} - Time on Ice Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-3">
              <h3 className="font-medium text-gray-700">Total Time on Ice</h3>
              <p className="text-2xl">{timeOnIce.timeOnIce}</p>
            </div>
            <div className="border rounded-md p-3">
              <h3 className="font-medium text-gray-700">Even Strength</h3>
              <p className="text-2xl">{timeOnIce.evenTimeOnIce}</p>
            </div>
            <div className="border rounded-md p-3">
              <h3 className="font-medium text-gray-700">Power Play</h3>
              <p className="text-2xl">{timeOnIce.powerPlayTimeOnIce}</p>
            </div>
            <div className="border rounded-md p-3">
              <h3 className="font-medium text-gray-700">Shorthanded</h3>
              <p className="text-2xl">{timeOnIce.shorthandedTimeOnIce}</p>
            </div>
            <div className="border rounded-md p-3 col-span-2">
              <h3 className="font-medium text-gray-700">Shifts</h3>
              <p className="text-2xl">{timeOnIce.shifts}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
