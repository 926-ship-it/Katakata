import React from "react";

/**
 * AestheticDoodles: Hand-crafted SVG & vector elements for girlhood scrapbook aesthetic:
 * 1. Pearl Strings / Single Lustrous Pearls (珍珠)
 * 2. Scalloped Lace Trims & Ribbons (蕾丝花边)
 * 3. Vintage Parasol / Pastel Umbrella (少女雨伞)
 * 4. Afternoon Tea Dessert Plate / Dish (下午茶盘子与法式甜点)
 * 5. Hand-drawn Pencil with Squiggly Underlines (手绘铅笔与涂鸦线)
 */

export const PearlString: React.FC<{ count?: number; className?: string }> = ({ count = 9, className = "" }) => (
  <div className={`flex items-center gap-1 select-none pointer-events-none ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <span
        key={i}
        className="w-2.5 h-2.5 rounded-full pearl-chain inline-block border border-pink-200/80 shadow-2xs transition-transform hover:scale-125"
        style={{
          boxShadow: "inset -1px -1px 2px rgba(219, 39, 119, 0.25), 0 1px 2px rgba(0,0,0,0.12)",
        }}
      />
    ))}
  </div>
);

export const ScallopLaceTrim: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 240 16"
    className={`w-full h-3 text-pink-300 pointer-events-none ${className}`}
    preserveAspectRatio="none"
  >
    <path
      d="M0,0 Q10,14 20,0 Q30,14 40,0 Q50,14 60,0 Q70,14 80,0 Q90,14 100,0 Q110,14 120,0 Q130,14 140,0 Q150,14 160,0 Q170,14 180,0 Q190,14 200,0 Q210,14 220,0 Q230,14 240,0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const GirlhoodUmbrella: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    {/* Canopy domes */}
    <path
      d="M24 6C13 6 5 15 5 26C8 24 13 24 17 26C21 24 27 24 31 26C35 24 40 24 43 26C43 15 35 6 24 6Z"
      fill="#FCE7F3"
      stroke="#BE185D"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Stripe highlights */}
    <path
      d="M24 6C20 12 18 20 17 26"
      stroke="#F472B6"
      strokeWidth="1.8"
      strokeDasharray="2 2"
    />
    <path
      d="M24 6C28 12 30 20 31 26"
      stroke="#F472B6"
      strokeWidth="1.8"
      strokeDasharray="2 2"
    />
    {/* Top tip */}
    <path d="M24 3V6" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" />
    {/* Umbrella shaft & curved hook handle */}
    <path
      d="M24 26V39C24 42 21 44 18.5 44C16 44 14.5 42 14.5 40"
      stroke="#BE185D"
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const DessertPlateDoodle: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 30 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 54 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    {/* Outer Porcelain Plate Rim */}
    <ellipse cx="27" cy="28" rx="25" ry="11" fill="#FFFFFF" stroke="#BE185D" strokeWidth="2.2" />
    {/* Inner Plate Well */}
    <ellipse cx="27" cy="28" rx="18" ry="7.5" fill="#FFF1F2" stroke="#F472B6" strokeWidth="1.5" strokeDasharray="3 2" />
    {/* Mini Cake / Tart on Plate */}
    <path
      d="M19 25L21 16C21 14 33 14 33 16L35 25Z"
      fill="#FBCFE8"
      stroke="#BE185D"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Cherry / Strawberry Topping */}
    <circle cx="27" cy="13" r="3.2" fill="#E11D48" stroke="#881337" strokeWidth="1.2" />
    <path d="M27 10Q29 6 32 7" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const HandDrawnPencil: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    {/* Pencil body tilted */}
    <g transform="rotate(35 24 24)">
      {/* Eraser */}
      <rect x="20" y="4" width="8" height="6" rx="2" fill="#FDA4AF" stroke="#BE185D" strokeWidth="1.8" />
      {/* Ferrule ring */}
      <rect x="20" y="10" width="8" height="3" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.4" />
      {/* Main wooden shaft */}
      <rect x="20" y="13" width="8" height="20" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.8" />
      {/* Lead tip triangle */}
      <path d="M20 33L24 41L28 33Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
      {/* Graphite nib */}
      <path d="M22.5 38L24 41L25.5 38Z" fill="#1E293B" />
    </g>
  </svg>
);

export const PencilSquiggleUnderline: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 160 12"
    className={`w-full h-2.5 text-rose-500 pointer-events-none ${className}`}
    preserveAspectRatio="none"
  >
    <path
      d="M2,6 C15,1 25,11 38,6 C51,1 61,11 74,6 C87,1 97,11 110,6 C123,1 133,11 146,6 C152,4 158,5 159,6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);
