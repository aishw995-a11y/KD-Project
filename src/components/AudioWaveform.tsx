import React, { useEffect, useState } from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording, barCount = 18 }) => {
  const [heights, setHeights] = useState<number[]>(new Array(barCount).fill(15));

  useEffect(() => {
    if (!isRecording) {
      setHeights(new Array(barCount).fill(10));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: barCount }, () => Math.floor(Math.random() * 65) + 15)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isRecording, barCount]);

  return (
    <div className="flex items-center justify-center space-x-1 h-16 px-4 bg-slate-900/90 rounded-2xl border border-slate-700/80">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-150 ${
            isRecording
              ? 'bg-gradient-to-t from-blue-500 via-indigo-400 to-purple-400 shadow-sm shadow-indigo-500/50'
              : 'bg-slate-600'
          }`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};
