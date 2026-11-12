import React from 'react';

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  size = 180,
  strokeWidth = 14,
  label,
  sublabel,
}) => {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 85) return { stroke: '#10b981', text: 'text-emerald-600', bg: 'text-emerald-500/10' };
    if (val >= 70) return { stroke: '#3b82f6', text: 'text-blue-600', bg: 'text-blue-500/10' };
    if (val >= 50) return { stroke: '#f59e0b', text: 'text-amber-600', bg: 'text-amber-500/10' };
    return { stroke: '#ef4444', text: 'text-rose-600', bg: 'text-rose-500/10' };
  };

  const colors = getColor(normalizedScore);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Centered label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-4xl font-extrabold tracking-tight ${colors.text}`}>
          {normalizedScore}
        </span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          out of 100
        </span>
        {label && <span className="text-xs font-bold text-slate-700 mt-1">{label}</span>}
        {sublabel && <span className="text-[10px] text-slate-400">{sublabel}</span>}
      </div>
    </div>
  );
};
