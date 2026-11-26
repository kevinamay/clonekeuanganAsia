import React from 'react';

export default function AsiaPlastikLogo({ className = "h-8 w-8", color = "#0C4F7A" }) {
  return (
    <svg
      viewBox="130 130 294 294"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Asia Plastik Logo"
    >
      <g fill={color}>
        <rect x="261" y="140" width="32" height="274" rx="16" />
        <path d="M 307.00 262.54 L 307.00 298.28 A 75.5 75.5 0 1 0 293.00 167.65 L 293.00 219.57 A 45.0 45.0 0 1 1 307.00 262.54 Z" />
        <path d="M 247.00 235.46 L 247.00 199.72 A 75.5 75.5 0 1 0 261.00 330.35 L 261.00 278.43 A 45.0 45.0 0 1 1 247.00 235.46 Z" />
      </g>
    </svg>
  );
}
