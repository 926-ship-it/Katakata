import React from "react";

interface CardIllustrationProps {
  id: string;
  category: "name" | "nature" | "culture" | "food";
  className?: string;
}

export const CardIllustration: React.FC<CardIllustrationProps> = ({ id, category, className = "w-16 h-16" }) => {
  // Render specific gorgeous SVG designs based on card ID
  switch (id) {
    case "sakura":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* Cherry Blossom Petal SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full fill-pink-400 drop-shadow-[0_2px_8px_rgba(236,72,153,0.3)] animate-pulse">
            <path d="M50,15 C45,35 25,45 25,60 C25,75 35,85 50,85 C65,85 75,75 75,60 C75,45 55,35 50,15 Z" />
            <circle cx="50" cy="62" r="5" className="fill-pink-200" />
            <path d="M50,55 L50,70 M42,62 L58,62" className="stroke-pink-100 stroke-[1.5] stroke-linecap-round" />
          </svg>
          <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping" />
        </div>
      );

    case "fuji":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* Mount Fuji SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_3px_10px_rgba(14,165,233,0.3)]">
            {/* Red Rising Sun */}
            <circle cx="50" cy="35" r="22" className="fill-rose-500/80" />
            
            {/* Fuji mountain silhouette */}
            <path d="M15,85 L35,50 L50,25 L65,50 L85,85 Z" className="fill-indigo-950/90" />
            {/* Snowy cap */}
            <path d="M41,40 L50,25 L59,40 L54,36 L50,39 L46,36 Z" className="fill-stone-50" />
            {/* Clouds */}
            <path d="M5,75 Q25,65 50,75 Q75,65 95,75" fill="none" className="stroke-indigo-300/40 stroke-2" />
          </svg>
        </div>
      );

    case "asagao":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* Morning Glory flower */}
          <svg viewBox="0 0 100 100" className="w-full h-full fill-violet-500 drop-shadow-[0_2px_8px_rgba(139,92,246,0.25)]">
            <circle cx="50" cy="50" r="30" className="opacity-80" />
            <polygon points="50,12 85,38 72,78 28,78 15,38" className="fill-violet-400 opacity-90" />
            <circle cx="50" cy="50" r="16" className="fill-stone-50" />
            <circle cx="50" cy="50" r="6" className="fill-yellow-300" />
            <path d="M50,8 L50,16 M90,50 L82,50 M50,92 L50,84 M10,50 L18,50" fill="none" className="stroke-violet-200 stroke-2" />
          </svg>
        </div>
      );

    case "dango":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* Three🍡 Dango on a skewer */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Skewer stick */}
            <line x1="50" y1="15" x2="50" y2="90" className="stroke-amber-700 stroke-[5] stroke-linecap-round" />
            
            {/* Top Dango (Pink) */}
            <circle cx="50" cy="30" r="15" className="fill-rose-350 stroke-rose-450 stroke-[1.5]" />
            <ellipse cx="46" cy="26" rx="4" ry="2" className="fill-pink-100 opacity-60" />

            {/* Middle Dango (White) */}
            <circle cx="50" cy="52" r="15" className="fill-stone-50 stroke-stone-300 stroke-[1.5]" />
            <ellipse cx="46" cy="48" rx="4" ry="2" className="fill-white opacity-90" />

            {/* Bottom Dango (Green) */}
            <circle cx="50" cy="74" r="15" className="fill-emerald-450 stroke-emerald-550 stroke-[1.5]" />
            <ellipse cx="46" cy="70" rx="4" ry="2" className="fill-green-100 opacity-60" />
          </svg>
        </div>
      );

    case "daruma":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* RED DARUMA DOLL SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)]">
            {/* Red body */}
            <circle cx="50" cy="54" r="38" className="fill-red-650" />
            {/* Golden trim detail */}
            <ellipse cx="50" cy="24" rx="14" ry="4" className="fill-amber-450" />
            
            {/* Face shield (White/Yellowish) */}
            <path d="M50,22 C30,22 24,40 24,56 C24,72 35,82 50,82 C65,82 76,72 76,56 C76,40 70,22 50,22 Z" className="fill-yellow-50" />
            
            {/* Left and Right big thick black eyebrows */}
            <path d="M30,38 Q38,32 44,40" fill="none" className="stroke-stone-900 stroke-[3.5] stroke-linecap-round" />
            <path d="M70,38 Q62,32 56,40" fill="none" className="stroke-stone-900 stroke-[3.5] stroke-linecap-round" />
            
            {/* Eyes (Left completed, Right empty / or both with classic black pupils) */}
            <circle cx="36" cy="48" r="7" className="fill-stone-900" />
            <circle cx="36" cy="48" r="2" className="fill-stone-50" />
            
            <circle cx="64" cy="48" r="7" className="fill-stone-900" style={{ fillOpacity: 0.15 }} />
            <circle cx="64" cy="48" r="3" className="fill-stone-900" /> {/* Half completed eye representing half-wish state */}

            {/* Red gold mustache whiskers */}
            <path d="M35,62 Q50,55 65,62 M32,56 Q50,51 68,56" fill="none" className="stroke-amber-600 stroke-2" />
            {/* Mouth */}
            <path d="M46,68 Q50,71 54,68" fill="none" className="stroke-stone-900 stroke-2" />
          </svg>
        </div>
      );

    case "heiwa":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* Zen Enso Circle with a delicate pigeon silhouette */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Brushed sumi-e circle brushstroke */}
            <circle cx="50" cy="50" r="34" fill="none" className="stroke-indigo-900/40 stroke-[4.5] stroke-dasharray-[180_40]" />
            <path d="M50,14 C65,14 84,30 84,50 C84,70 66,86 50,86 C32,86 16,68 18,50" fill="none" className="stroke-indigo-950 stroke-[6.5] stroke-linecap-round opacity-80" />
            
            {/* Peaceful Dove */}
            <path d="M42,42 Q46,34 56,38 C56,38 60,34 66,38 Q58,48 54,58 M36,46 Q40,46 45,49" fill="none" className="stroke-emerald-600 stroke-2 stroke-linecap-round" />
            <circle cx="50" cy="48" r="8" className="fill-emerald-500/25" />
          </svg>
        </div>
      );

    case "kabuki":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* Kabuki dynamic mask graphics */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_10px_rgba(239,68,68,0.3)]">
            <rect x="25" y="15" width="50" height="70" rx="25" className="fill-stone-50 stroke-stone-800 stroke-2" />
            {/* Red streak martial paint */}
            <path d="M26,30 Q38,24 40,40 M74,30 Q62,24 60,40" fill="none" className="stroke-rose-600 stroke-[4] stroke-linecap-round" />
            <path d="M30,55 Q35,68 50,68 Q65,68 70,55" fill="none" className="stroke-rose-600 stroke-3" />
            {/* Deep black dramatic eyes */}
            <polygon points="34,42 44,45 38,48" className="fill-stone-900" />
            <polygon points="66,42 56,45 62,48" className="fill-stone-900" />
            <circle cx="39" cy="45" r="1.5" className="fill-red-500" />
            <circle cx="61" cy="45" r="1.5" className="fill-red-500" />
            {/* Black hair headpiece top bar */}
            <path d="M25,25 Q50,12 75,25 L75,15 Q50,5 25,15 Z" className="fill-indigo-950" />
          </svg>
        </div>
      );

    case "sushi":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* Classic Maguro Tuna Nigiri Sushi */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_3px_6px_rgba(0,0,0,0.1)]">
            {/* White Rice Pillow underneath */}
            <ellipse cx="50" cy="62" rx="28" ry="15" className="fill-stone-50 stroke-stone-200 stroke" />
            <circle cx="38" cy="64" r="3" className="fill-stone-100" />
            <circle cx="62" cy="60" r="2.5" className="fill-stone-100" />

            {/* Glossy Red Tuna Strip draping over */}
            <path d="M18,50 C30,34 70,34 82,50 C85,55 80,64 74,62 C60,54 40,54 26,62 C20,64 16,55 18,50 Z" className="fill-red-500" />
            {/* White marbled fatty strips */}
            <path d="M26,48 Q45,41 62,50 M32,45 Q50,38 72,46 M38,42 Q50,36 78,41" fill="none" className="stroke-pink-100/60 stroke-2 stroke-linecap-round" />
            {/* Wasabi smudge peek */}
            <circle cx="50" cy="54" r="5" className="fill-lime-600/70 blur-[1px]" />
          </svg>
        </div>
      );

    case "matcha":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* Matcha premium clay bowl and bamboo whisk */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Clay 茶碗 bowl silhouette */}
            <path d="M20,40 L80,40 C80,68 68,82 50,82 C32,82 20,68 20,40 Z" className="fill-amber-900/90" />
            {/* Rich frothy moss-green matcha inside */}
            <ellipse cx="50" cy="42" rx="28" ry="8" className="fill-emerald-700" />
            <ellipse cx="48" cy="43" rx="22" ry="5" className="fill-emerald-500 animate-pulse" />
            
            {/* Bubbles */}
            <circle cx="38" cy="42" r="1.5" className="fill-yellow-100/80" />
            <circle cx="60" cy="41" r="1" className="fill-yellow-100/80" />
            <circle cx="48" cy="44" r="2" className="fill-lime-350/90" />
          </svg>
        </div>
      );

    case "aozora":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="35" className="fill-sky-400/20" />
            {/* Golden cloud */}
            <path d="M25,60 Q30,50 40,52 Q45,42 55,45 Q65,42 70,52 Q75,50 80,60 Z" className="fill-sky-500/85" />
            {/* Wind lines */}
            <path d="M15,40 Q35,32 55,40 Q75,48 90,40 M20,50 Q45,44 65,52" fill="none" className="stroke-sky-200 stroke-2 stroke-linecap-round" />
          </svg>
        </div>
      );

    case "shiki":
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* Seasonal mandala structure representing the four quadrants */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="36" className="fill-emerald-500/10 stroke-emerald-500/25 stroke" />
            <line x1="50" y1="14" x2="50" y2="86" className="stroke-stone-300 stroke-dashed" />
            <line x1="14" y1="50" x2="86" y2="50" className="stroke-stone-300 stroke-dashed" />
            
            {/* Spring pink petal */}
            <circle cx="36" cy="36" r="6" className="fill-pink-400" />
            {/* Summer green leaf */}
            <circle cx="64" cy="36" r="6" className="fill-emerald-500" />
            {/* Autumn orange maple leaf */}
            <circle cx="64" cy="64" r="6" className="fill-amber-600" />
            {/* Winter white ice crystal */}
            <circle cx="36" cy="64" r="6" className="fill-sky-200" />
          </svg>
        </div>
      );

    default:
      // Fallback placeholder based on categories
      if (category === "name") {
        return (
          <div className={`relative flex items-center justify-center ${className}`}>
            {/* Cute Japanese imperial family crest or simple elegant Mon badge */}
            <svg viewBox="0 0 100 100" className="w-full h-full fill-stone-800/15">
              <circle cx="50" cy="50" r="35" fill="none" className="stroke-stone-700/25 stroke-2" />
              <circle cx="50" cy="50" r="28" fill="none" className="stroke-stone-700/20 stroke-dashed" />
              <path d="M50,22 L58,40 L78,40 L62,52 L68,72 L50,60 L32,72 L38,52 L22,40 L42,40 Z" className="fill-amber-800/20" />
            </svg>
          </div>
        );
      } else if (category === "food") {
        return (
          <div className={`relative flex items-center justify-center ${className}`}>
            {/* Retro traditional Japanese food bowl */}
            <svg viewBox="0 0 100 100" className="w-full h-full fill-stone-100">
              <path d="M20,45 L80,45 C80,65 65,75 50,75 C35,75 20,65 20,45 Z" className="fill-orange-600/30 stroke-orange-700/20" />
              <ellipse cx="50" cy="45" rx="30" ry="6" className="fill-stone-50 stroke-stone-300" />
              {/* Steaming vapor wave */}
              <path d="M42,32 Q46,24 44,18 M50,34 Q54,26 52,20 M58,32 Q62,24 60,18" fill="none" className="stroke-orange-400 stroke-2 stroke-linecap-round opacity-60" />
            </svg>
          </div>
        );
      } else if (category === "culture") {
        return (
          <div className={`relative flex items-center justify-center ${className}`}>
            {/* Japanese temple gate Torii or talisman wave */}
            <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-sm scale-75">
              {/* Torii Gate */}
              <rect x="20" y="44" width="60" height="6" rx="2" className="fill-red-650" />
              <rect x="24" y="56" width="52" height="4" rx="1" className="fill-red-650" />
              {/* Two columns */}
              <line x1="34" y1="56" x2="34" y2="100" className="stroke-red-650 stroke-[6]" />
              <line x1="66" y1="56" x2="66" y2="100" className="stroke-red-650 stroke-[6]" />
              {/* Black roof cap */}
              <path d="M15,40 Q50,30 85,40 L85,45 Q50,35 15,45 Z" className="fill-stone-900" />
            </svg>
          </div>
        );
      } else {
        // Nature category generic visual
        return (
          <div className={`relative flex items-center justify-center ${className}`}>
            {/* Classic Japanese cloud patterns and ripples */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M30,45 C35,38 45,38 50,45 C55,38 65,38 70,45 C75,52 65,60 50,60 C35,60 25,52 30,45 Z" className="fill-sky-500/20 stroke-sky-400/30" />
              <path d="M15,70 Q50,62 85,70 M25,80 Q50,72 75,80" fill="none" className="stroke-sky-300 stroke-2 stroke-linecap-round" />
            </svg>
          </div>
        );
      }
  }
};
