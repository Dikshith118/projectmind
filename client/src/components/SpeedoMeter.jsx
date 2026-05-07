export default function SpeedoMeter({ percentage, label = "Completed" }) {
  // Ensure percentage is between 0 and 100
  const value = Math.min(100, Math.max(0, percentage));
  
  // Calculate rotation angle (180 degrees for semi-circle, from -90 to 90)
  const rotation = -90 + (value / 100) * 180;
  
  // Determine color based on percentage
  const getColor = () => {
    if (value >= 80) return { from: '#10b981', to: '#059669', text: 'text-emerald-400' }; // Green
    if (value >= 50) return { from: '#06b6d4', to: '#0284c7', text: 'text-cyan-400' }; // Cyan
    if (value >= 30) return { from: '#f59e0b', to: '#d97706', text: 'text-yellow-400' }; // Yellow
    return { from: '#ef4444', to: '#dc2626', text: 'text-red-400' }; // Red
  };
  
  const colors = getColor();
  
  // Create gradient ID
  const gradientId = `speedoGradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      {/* SVG Speedometer */}
      <div className="relative w-full max-w-[260px]">
        <svg
          width="100%"
          height="150"
          viewBox="0 0 260 150"
          className="overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background arc (gray) */}
          <path
            d="M 50 120 A 80 80 0 0 1 210 120"
            fill="none"
            stroke="rgba(148, 163, 184, 0.12)"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Progress arc (colored) */}
          <path
            d="M 50 120 A 80 80 0 0 1 210 120"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * value) / 100}
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: 'url(#glow)'
            }}
          />
          
          {/* Center dot */}
          <circle
            cx="130"
            cy="120"
            r="6"
            fill="rgba(148, 163, 184, 0.25)"
          />
          
          {/* Needle */}
          <line
            x1="130"
            y1="120"
            x2="130"
            y2="50"
            stroke={colors.from}
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transformOrigin: '130px 120px',
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: 'url(#glow)'
            }}
          />
          
          {/* Needle tip circle */}
          <circle
            cx="130"
            cy="120"
            r="5"
            fill={colors.from}
            style={{
              filter: 'url(#glow)'
            }}
          />
        </svg>
        
        {/* Percentage display - positioned absolutely in center */}
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className={`text-5xl font-black ${colors.text} drop-shadow-lg leading-none`}>
            {value}%
          </p>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wider">
            {label}
          </p>
        </div>
      </div>
      
      {/* Task completion info */}
      <div className="mt-2 text-center">
        <p className="text-xs text-slate-500 font-medium">
          {value}% of work completed
        </p>
      </div>
    </div>
  );
}
