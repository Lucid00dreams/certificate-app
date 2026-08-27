/**
 * Metallic Forest Green & Gold wax seal mark.
 */
export function Seal({
  size = 88,
  animate = false,
  className = "",
}: {
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Subtle outer gold glow */}
      <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md animate-pulse-glow" />
      
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`relative z-10 ${animate ? "animate-stamp-in" : ""}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sealGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D77F" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9A7B20" />
          </linearGradient>

          <linearGradient id="sealForest" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#065F46" />
            <stop offset="50%" stopColor="#044E3B" />
            <stop offset="100%" stopColor="#022C22" />
          </linearGradient>

          <filter id="sealDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Gold Ring */}
        <circle cx="50" cy="50" r="48" fill="url(#sealGold)" filter="url(#sealDropShadow)" />
        
        {/* Inner Forest Green Wax Body */}
        <circle cx="50" cy="50" r="42" fill="url(#sealForest)" />

        {/* Inner Dashed Gold Border */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="#FDFBF7"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.9"
        />

        {/* Center Gold Emblem */}
        <path
          d="M50 24 L55 38 L70 38 L58 47 L62 62 L50 53 L38 62 L42 47 L30 38 L45 38 Z"
          fill="url(#sealGold)"
          stroke="#FFFFFF"
          strokeWidth="0.5"
        />

        {/* Decorative Ribbons at Bottom */}
        <path
          d="M32 78 L26 94 L36 88 L46 94 L42 78 Z"
          fill="url(#sealGold)"
          opacity="0.95"
        />
        <path
          d="M68 78 L74 94 L64 88 L54 94 L58 78 Z"
          fill="url(#sealGold)"
          opacity="0.95"
        />
      </svg>
    </div>
  );
}
