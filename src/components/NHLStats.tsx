'use client';

import { useState, useEffect } from 'react';
import { TOITracker } from './TOITracker';
import { NeoSelect } from './ui/NeoSelect';
import { getAvailableSeasons } from '@/utils/nhlSeasons';

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
  const [selectedSeason, setSelectedSeason] = useState<string>(getAvailableSeasons()[0].value);

  // Prepare data for TOITracker
  const [playerGameData, setPlayerGameData] = useState<any[]>([]);

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

  // Fetch roster when a team or season is selected
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

        const response = await fetch(`/api/nhl/roster/${selectedTeam}?season=${selectedSeason}`);
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
  }, [selectedTeam, selectedSeason]);

  // Fetch schedule when a team or season is selected
  useEffect(() => {
    if (!selectedTeam) return;

    async function fetchSchedule() {
      try {
        setLoading(true);
        setGames([]);
        setSelectedGame(null);
        setTimeOnIce(null);

        const response = await fetch(
          `/api/nhl/schedule/${selectedTeam}?limit=${gameLimit}&season=${selectedSeason}`
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
  }, [selectedTeam, gameLimit, selectedSeason]);

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

  // Fetch player's time on ice history for multiple games when a player or season is selected
  useEffect(() => {
    if (!selectedPlayer) return;

    async function fetchPlayerGameHistory() {
      try {
        setLoading(true);
        setError(null);

        console.log(
          `Fetching game history for player ${selectedPlayer} with limit ${gameLimit} for season ${selectedSeason}`
        );

        // Fetch the player's games data with the user-selected game limit and season
        const response = await fetch(
          `/api/nhl/player/${selectedPlayer}/gameLog?limit=${gameLimit}&season=${selectedSeason}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error (${response.status}): ${errorText}`);
          throw new Error(`API returned status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Player game history:', data);

        if (data.games && data.games.length > 0) {
          console.log(
            `Received ${data.games.length} games with time on ice data`
          );
          console.log('First game sample:', data.games[0]);
          setPlayerGameData(data.games);
        } else {
          console.warn('No game data received or empty games array');
          setPlayerGameData([]);
        }
      } catch (err) {
        console.error('Error fetching player game history:', err);
        setError('Could not load player game history. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    // Always fetch player game history when a player is selected or game limit/season changes
    fetchPlayerGameHistory();
  }, [selectedPlayer, gameLimit, selectedSeason]);

  const handleTeamChange = (index: number) => {
    if (index >= 0 && index < teams.length) {
      setSelectedTeam(teams[index].abbrev);
    }
  };

  const handlePlayerChange = (index: number) => {
    if (index >= 0 && index < players.length) {
      setSelectedPlayer(players[index].id);
    }
  };

  const handleGameChange = (index: number) => {
    if (index === 0) {
      setSelectedGame(null); // "View game history" option
    } else if (index > 0 && index <= games.length) {
      setSelectedGame(games[index - 1].id);
    }
  };

  const handleLimitChange = (index: number) => {
    const limitOptions = [5, 10, 20, 50, 100];
    if (index >= 0 && index < limitOptions.length) {
      const newLimit = limitOptions[index];
      console.log(`Changing game limit to ${newLimit}`);
      setGameLimit(newLimit);
    }
  };

  const handleSeasonChange = (index: number) => {
    const seasons = getAvailableSeasons();
    if (index >= 0 && index < seasons.length) {
      setSelectedSeason(seasons[index].value);
      console.log(`Changing season to ${seasons[index].label}`);
    }
  };

  // Get player details for the selected player
  const selectedPlayerDetails = selectedPlayer
    ? players.find((p) => p.id === selectedPlayer)
    : null;

  // Prepare selector items for TOITracker
  const teamItems = teams.map((team) => team.name);
  const playerItems = players.map(
    (player) =>
      `${player.firstName.default} ${player.lastName.default} (#${player.sweaterNumber}) - ${player.positionCode}`
  );
  const gameItems = [
    'View game history instead',
    ...games.map(
      (game) =>
        `${new Date(game.gameDate).toLocaleDateString()} - ${
          game.awayTeam.abbrev
        } @ ${game.homeTeam.abbrev}`
    ),
  ];
  const limitItems = [
    '5 games',
    '10 games',
    '20 games',
    '50 games',
    'All games',
  ];
  const seasonItems = getAvailableSeasons().map(s => s.label);

  // Find indices for the current selections
  const teamIndex = teams.findIndex((team) => team.abbrev === selectedTeam);
  const playerIndex = players.findIndex(
    (player) => player.id === selectedPlayer
  );
  const gameIndex = selectedGame
    ? games.findIndex((game) => game.id === selectedGame) + 1 // +1 for the "View history" option
    : 0;
  const limitOptions = [5, 10, 20, 50, 100];
  const limitIndex = limitOptions.indexOf(gameLimit);
  const seasonIndex = getAvailableSeasons().findIndex(s => s.value === selectedSeason);

  return (
    <div className="p-4 font-sans flex flex-col lg:flex-row items-start gap-8">
      {/* Neo-brutalist Header with selectors */}
      <div className="w-full lg:w-[400px] lg:sticky lg:top-4 border-8 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        <h1 className="text-5xl font-black mb-2 tracking-tight">
          ICE TIME TRACKER
        </h1>
        <div className="h-3 w-40 bg-black mb-4"></div>
        <p className="text-xl mb-6">
          Track your favorite players' time on ice stats!
        </p>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {/* Selectors in the header */}
        <div className="grid grid-cols-1 gap-4 mt-4 pt-6 border-t-4 border-black">
          <div className="selector-group">
            <div className="font-bold text-sm mb-2">SEASON</div>
            <NeoSelect
              items={seasonItems}
              value={seasonIndex >= 0 ? seasonIndex : undefined}
              onChange={handleSeasonChange}
              className="w-full"
              placeholder="Select a season..."
            />
          </div>

          <div className="selector-group">
            <div className="font-bold text-sm mb-2">TEAM</div>
            <NeoSelect
              items={teamItems}
              value={teamIndex >= 0 ? teamIndex : undefined}
              onChange={handleTeamChange}
              className="w-full"
              placeholder="Select a team..."
            />
          </div>

          <div className="selector-group">
            <div className="font-bold text-sm mb-2">PLAYER</div>
            <NeoSelect
              items={playerItems}
              value={playerIndex >= 0 ? playerIndex : undefined}
              onChange={handlePlayerChange}
              className="w-full"
              disabled={players.length === 0}
              placeholder={
                selectedTeam ? 'Select a player...' : 'First select a team...'
              }
            />
          </div>

          <div className="selector-group">
            <div className="font-bold text-sm mb-2">GAMES TO SHOW</div>
            <NeoSelect
              items={limitItems}
              value={limitIndex >= 0 ? limitIndex : undefined}
              onChange={handleLimitChange}
              className="w-full"
              placeholder="Choose number of games..."
            />
          </div>

          {/* Specific game selector (Commented out for now) */}
          {/* <div className="selector-group">
            <div className="font-bold text-sm mb-2">
              SPECIFIC GAME (OPTIONAL)
            </div>
            <NeoSelect
              items={gameItems.length > 1 ? gameItems : []}
              value={gameIndex === 0 && !selectedGame ? undefined : gameIndex}
              onChange={handleGameChange}
              className="w-full"
              disabled={games.length === 0}
              placeholder={
                selectedTeam
                  ? 'Select a specific game...'
                  : 'First select a team...'
              }
            />
          </div> */}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center p-4 mt-6 border-4 border-black">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
            <div className="font-bold">LOADING STATS...</div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 w-full lg:w-auto min-w-0">
        {/* TOI Display - show when we have player data and not loading */}
        {selectedPlayerDetails && !loading && (
          <TOITracker
            playerName={`${selectedPlayerDetails.firstName.default} ${selectedPlayerDetails.lastName.default}`}
            playerNumber={selectedPlayerDetails.sweaterNumber}
            position={selectedPlayerDetails.positionCode}
            team={selectedTeam}
            games={playerGameData}
            playerId={selectedPlayer?.toString()}
            gameLimit={gameLimit}
            season={selectedSeason}
            singleGameData={
              timeOnIce
                ? {
                    timeOnIce: timeOnIce.timeOnIce,
                    evenTimeOnIce: timeOnIce.evenTimeOnIce,
                    powerPlayTimeOnIce: timeOnIce.powerPlayTimeOnIce,
                    shorthandedTimeOnIce: timeOnIce.shorthandedTimeOnIce,
                    shifts: timeOnIce.shifts,
                  }
                : undefined
            }
          />
        )}

        {/* show a section that shows while loading */}
        {loading && (
          <div className="border-8 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center flex justify-center items-center">
            <p className="text-2xl font-bold">LOADING STATS...</p>
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin ml-3"></div>
          </div>
        )}

        {/* Show a message when no player is selected */}
        {!selectedPlayerDetails && !loading && (
          <div className="border-8 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
            <p className="text-2xl font-bold">
              Select a team and player above to view ice time stats!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
