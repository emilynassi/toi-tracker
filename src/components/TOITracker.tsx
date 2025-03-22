'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Sample data
const samplePlayerData = {
  name: 'Connor McDavid',
  number: 97,
  team: 'Edmonton Oilers',
  position: 'Center',
  averageTOI: 22.4,
  games: [
    { game: 'vs CGY', timeOnIce: 24.5, date: 'Oct 12' },
    { game: 'vs VAN', timeOnIce: 23.2, date: 'Oct 14' },
    { game: 'vs SEA', timeOnIce: 25.1, date: 'Oct 17' },
    { game: 'vs WPG', timeOnIce: 21.8, date: 'Oct 19' },
    { game: 'vs STL', timeOnIce: 20.4, date: 'Oct 22' },
    { game: 'vs DAL', timeOnIce: 19.5, date: 'Oct 24' },
  ],
};

// Custom tooltip component with neobrutalist style
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-4 border-black p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <p className="font-bold">{label}</p>
        <p className="text-lg">
          <span className="font-bold">TOI:</span> {payload[0].value} min
        </p>
      </div>
    );
  }
  return null;
};

export function TOITracker() {
  const [highlightedGame, setHighlightedGame] = useState<number | null>(null);

  // Random accent colors in neobrutalist style
  const accentColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C'];
  const randomColor =
    accentColors[Math.floor(Math.random() * accentColors.length)];

  return (
    <div className="font-sans max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-12 border-8 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-5xl font-black mb-2 tracking-tight">
          ICE TIME TRACKER
        </h1>
        <div className="h-3 w-40 bg-black mb-4"></div>
        <p className="text-xl">
          Track your favorite players' time on ice stats!
        </p>
      </div>

      {/* Player Card */}
      <div className="border-8 border-black bg-white p-6 mb-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-4xl font-black">{samplePlayerData.name}</h2>
            <div className="flex mt-2 gap-4">
              <span className="bg-black text-white px-2 py-1 font-bold">
                #{samplePlayerData.number}
              </span>
              <span className="border-4 border-black px-2 py-1 font-bold">
                {samplePlayerData.position}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 p-4 border-4 border-black bg-yellow-300 transform rotate-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-3xl font-black">{samplePlayerData.averageTOI}</p>
            <p className="text-sm font-bold">AVG MINUTES</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="h-72 w-full border-4 border-black p-4 bg-white mb-6">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={samplePlayerData.games}
              onMouseMove={(data: any) => {
                if (data && data.activeTooltipIndex !== undefined) {
                  setHighlightedGame(data.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setHighlightedGame(null)}
            >
              <XAxis
                dataKey="game"
                stroke="#000"
                strokeWidth={2}
                tick={{ fontSize: 14, fontWeight: 'bold' }}
              />
              <YAxis
                stroke="#000"
                strokeWidth={2}
                tick={{ fontSize: 14, fontWeight: 'bold' }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'transparent' }}
              />
              <Bar
                dataKey="timeOnIce"
                fill={randomColor}
                stroke="#000"
                strokeWidth={3}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Game List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {samplePlayerData.games.map((game, index) => (
            <div
              key={index}
              className={`border-4 border-black p-4 transform ${
                highlightedGame === index
                  ? 'bg-yellow-300 -rotate-1'
                  : 'bg-white'
              } transition-all duration-200`}
            >
              <div className="font-black text-xl">{game.game}</div>
              <div className="text-sm font-bold">{game.date}</div>
              <div className="text-3xl font-black mt-2">
                {game.timeOnIce} <span className="text-base">min</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        <button className="border-4 border-black bg-cyan-400 px-6 py-3 font-bold text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all">
          NEW PLAYER
        </button>
        <button className="border-4 border-black bg-pink-400 px-6 py-3 font-bold text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all">
          MORE STATS
        </button>
      </div>
    </div>
  );
}
