import React from 'react';

export interface IconProps {
  className?: string;
  size?: number;
}

/**
 * SNNS 365 BESPOKE ICON SUITE
 * Style: Neo-Prismatic Sovereign Dimension (الزجاج المنشوري والأبعاد النيومورفية الفاخرة)
 * Custom-crafted unique iconography exclusive to SNNS. Zero imitation of Microsoft, Google or stock flat templates.
 */

// 1. SNNS Word / Manuscripts & Documents
export const WordIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsWordBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B132B" />
        <stop offset="0.5" stopColor="#1C2541" />
        <stop offset="1" stopColor="#1E3A8A" />
      </linearGradient>
      <linearGradient id="snnsWordSheet" x1="16" y1="10" x2="48" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.7" stopColor="#DBEAFE" />
        <stop offset="1" stopColor="#93C5FD" />
      </linearGradient>
      <linearGradient id="snnsWordQuill" x1="28" y1="18" x2="52" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="0.5" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
      <filter id="snnsWordGlow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Squircle Base with Micro-border */}
    <rect width="64" height="64" rx="16" fill="url(#snnsWordBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Floating Manuscript Sheet Back Layer */}
    <rect x="14" y="15" width="30" height="38" rx="6" fill="#1E40AF" opacity="0.6" />

    {/* Main Floating Parchment Surface */}
    <rect x="18" y="11" width="30" height="38" rx="6" fill="url(#snnsWordSheet)" />

    {/* Manuscript Embossed Micro-lines */}
    <line x1="24" y1="19" x2="36" y2="19" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="24" y1="25" x2="42" y2="25" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="30" x2="40" y2="30" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="35" x2="38" y2="35" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />

    {/* Floating Crystalline Quill Fountain Nib */}
    <g filter="url(#snnsWordGlow)">
      <path
        d="M48 20L53 25L37 47C35.5 49 33 50 30 50L28 50L29 48L32 45L48 20Z"
        fill="url(#snnsWordQuill)"
      />
      <circle cx="34" cy="44" r="1.5" fill="#FFFFFF" />
      <path d="M48 20L53 25L49 29L44 24L48 20Z" fill="#93C5FD" />
      <path d="M28 50L31 46" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    {/* Luminous Apex Star Sparkle */}
    <circle cx="51" cy="22" r="1.5" fill="#FFFFFF" />
  </svg>
);

// 2. SNNS Excel / Quantum Grid & Analytics
export const ExcelIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsExcelBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#022C22" />
        <stop offset="0.5" stopColor="#064E3B" />
        <stop offset="1" stopColor="#065F46" />
      </linearGradient>
      <linearGradient id="snnsBar1" x1="18" y1="34" x2="26" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34D399" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="snnsBar2" x1="28" y1="24" x2="36" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6EE7B7" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="snnsBar3" x1="38" y1="15" x2="46" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A7F3D0" />
        <stop offset="1" stopColor="#34D399" />
      </linearGradient>
      <linearGradient id="snnsTrendLine" x1="14" y1="38" x2="48" y2="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Emerald Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsExcelBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Isometric Matrix Grid Lattice */}
    <path d="M14 26H50M14 36H50M14 46H50" stroke="#047857" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    <path d="M26 14V50M38 14V50" stroke="#047857" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

    {/* 3D Ascending Quantum Data Pillars */}
    <rect x="18" y="32" width="7" height="18" rx="2.5" fill="url(#snnsBar1)" />
    <rect x="28" y="22" width="7" height="28" rx="2.5" fill="url(#snnsBar2)" />
    <rect x="38" y="14" width="7" height="36" rx="2.5" fill="url(#snnsBar3)" />

    {/* Analytical Trajectory Curve with Nodes */}
    <path
      d="M16 38L22 30L32 20L42 12"
      stroke="url(#snnsTrendLine)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Glowing Data Intersection Pearls */}
    <circle cx="22" cy="30" r="2.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="1" />
    <circle cx="32" cy="20" r="2.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="1" />
    <circle cx="42" cy="12" r="3" fill="#FDE047" />
  </svg>
);

// 3. SNNS PowerPoint / Radiance & Presentation Stages
export const PowerPointIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsPptBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#450A0A" />
        <stop offset="0.5" stopColor="#7C2D12" />
        <stop offset="1" stopColor="#9A3412" />
      </linearGradient>
      <linearGradient id="snnsPptLens" x1="18" y1="18" x2="48" y2="46" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDBA74" />
        <stop offset="0.5" stopColor="#FB923C" />
        <stop offset="1" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient id="snnsPptBeam" x1="24" y1="24" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF08A" stopOpacity="0.8" />
        <stop offset="1" stopColor="#F97316" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Solar Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsPptBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#F97316" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Projector Cone Light Rays */}
    <path d="M24 24L48 14V42L24 32Z" fill="url(#snnsPptBeam)" />

    {/* Tiered Solar Amphitheater Rings */}
    <path
      d="M16 46C20 38 28 34 38 34C48 34 54 40 56 46"
      stroke="#EA580C"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.5"
    />

    {/* Central Floating Holographic Diamond Slide */}
    <rect
      x="22"
      y="18"
      width="24"
      height="18"
      rx="4"
      fill="url(#snnsPptLens)"
      stroke="#FFEDD5"
      strokeWidth="1.2"
    />

    {/* Presentation Showcase Chart inside slide */}
    <path d="M26 29L31 24L36 27L42 21" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="42" cy="21" r="1.5" fill="#FEF08A" />

    {/* Radiant Prismatic Flare Star */}
    <path
      d="M18 42L19.5 38.5L23 37L19.5 35.5L18 32L16.5 35.5L13 37L16.5 38.5L18 42Z"
      fill="#FDBA74"
    />
  </svg>
);

// 4. SNNS Outlook / Photonic Communications & Mail
export const OutlookIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsOutlookBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#082F49" />
        <stop offset="0.5" stopColor="#0369A1" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="snnsCarrierGrad" x1="16" y1="18" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.6" stopColor="#BAE6FD" />
        <stop offset="1" stopColor="#38BDF8" />
      </linearGradient>
      <linearGradient id="snnsSignalGrad" x1="32" y1="12" x2="52" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Azure Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsOutlookBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Sovereign Communication Wave Rings */}
    <circle cx="32" cy="32" r="22" stroke="#0284C7" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
    <circle cx="32" cy="32" r="16" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

    {/* Supersonic Geometric Carrier Envelope / Falcon Fold */}
    <path
      d="M14 24L32 37L50 24L32 17L14 24Z"
      fill="#E0F2FE"
    />
    <path
      d="M14 24L32 37V49L14 36V24Z"
      fill="#7DD3FC"
    />
    <path
      d="M50 24L32 37V49L50 36V24Z"
      fill="#0284C7"
    />

    {/* Central Holographic Security Seal */}
    <circle cx="32" cy="37" r="4.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
    <circle cx="32" cy="37" r="2" fill="#0369A1" />

    {/* Speed Telemetry Trail */}
    <path d="M12 44L22 44M10 48L18 48" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 5. SNNS Teams / Concentric Collaboration Nexus
export const TeamsIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsTeamsBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E1B4B" />
        <stop offset="0.5" stopColor="#312E81" />
        <stop offset="1" stopColor="#4338CA" />
      </linearGradient>
      <linearGradient id="snnsOrb1" x1="20" y1="16" x2="34" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#818CF8" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
      <linearGradient id="snnsOrb2" x1="32" y1="20" x2="48" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C084FC" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Indigo Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsTeamsBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#818CF8" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Intertwined Collaboration Orbit Ring */}
    <ellipse
      cx="32"
      cy="34"
      rx="20"
      ry="9"
      transform="rotate(-20 32 34)"
      stroke="#A5B4FC"
      strokeWidth="2"
      strokeDasharray="4 2"
      opacity="0.8"
    />

    {/* Team Member Synergy Nodes (Synchronized Avatars as Luminous Gems) */}
    <circle cx="24" cy="24" r="6" fill="url(#snnsOrb1)" />
    <path d="M15 42C15 36 19 33 24 33C29 33 33 36 33 42" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />

    <circle cx="40" cy="22" r="7" fill="url(#snnsOrb2)" />
    <path d="M31 43C31 36 35 32 40 32C45 32 49 36 49 43" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />

    {/* Center High-Energy Audio/Voice Spark */}
    <circle cx="32" cy="33" r="3" fill="#FFFFFF" />
    <circle cx="32" cy="33" r="1.5" fill="#4F46E5" />
  </svg>
);

// 6. SNNS OneDrive / Floating Crystal Data Vault
export const OneDriveIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsDriveBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#082F49" />
        <stop offset="0.5" stopColor="#0369A1" />
        <stop offset="1" stopColor="#0EA5E9" />
      </linearGradient>
      <linearGradient id="snnsDriveCloud" x1="14" y1="20" x2="50" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.4" stopColor="#E0F2FE" />
        <stop offset="0.8" stopColor="#7DD3FC" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Cyan Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsDriveBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Ambient Storage Matrix Contour */}
    <circle cx="32" cy="34" r="18" fill="#0284C7" opacity="0.3" />

    {/* Prismatic Layered Cloud Formation */}
    <path
      d="M23 44H45C49.4 44 53 40.4 53 36C53 31.9 49.9 28.5 45.9 28.1C44.8 21.3 39 16 32 16C26.1 16 21.1 20 19.3 25.5C15.2 26.2 12 29.7 12 34C12 39.5 16.5 44 23 44Z"
      fill="url(#snnsDriveCloud)"
    />

    {/* Crystal Data Core Polygon */}
    <polygon points="32,24 38,32 32,40 26,32" fill="#0369A1" opacity="0.8" />
    <polygon points="32,27 36,32 32,37 28,32" fill="#FFFFFF" />
  </svg>
);

// 7. SNNS Copilot / Neural Intelligence Spark
export const CopilotIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsCopilotBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#090D16" />
        <stop offset="0.5" stopColor="#1E1B4B" />
        <stop offset="1" stopColor="#311042" />
      </linearGradient>
      <linearGradient id="snnsCopilotArc1" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.3" stopColor="#818CF8" />
        <stop offset="0.7" stopColor="#C084FC" />
        <stop offset="1" stopColor="#F472B6" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Aurora Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsCopilotBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#C084FC" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Dual Interlaced Mobius Energy Arcs */}
    <path
      d="M20 28C20 20 26 15 34 15C42 15 48 21 48 29C48 37 38 41 30 45C24 48 18 50 18 48C18 42 22 36 29 32C36 28 44 26 44 22"
      stroke="url(#snnsCopilotArc1)"
      strokeWidth="4"
      strokeLinecap="round"
    />

    {/* Central Core Luminescence */}
    <circle cx="34" cy="30" r="5" fill="#38BDF8" />
    <circle cx="34" cy="30" r="2.5" fill="#FFFFFF" />

    {/* Micro Satellite Particles */}
    <circle cx="48" cy="22" r="2" fill="#F472B6" />
    <circle cx="18" cy="40" r="2" fill="#38BDF8" />
  </svg>
);

// 8. SNNS AI Suite / Cosmic Hyper-Brain
export const SnnsAiIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsAiSuiteBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#030712" />
        <stop offset="0.5" stopColor="#0F172A" />
        <stop offset="1" stopColor="#1E1B4B" />
      </linearGradient>
      <linearGradient id="snnsAiSpectrum" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00F2FE" />
        <stop offset="0.3" stopColor="#4FACFE" />
        <stop offset="0.7" stopColor="#A855F7" />
        <stop offset="1" stopColor="#EC4899" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Cyber Glass Rim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsAiSuiteBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#00F2FE" strokeWidth="1.5" strokeOpacity="0.5" />

    {/* Dual Counter-rotating Gyroscopic Energy Rings */}
    <ellipse
      cx="32"
      cy="32"
      rx="21"
      ry="9"
      transform="rotate(-30 32 32)"
      stroke="url(#snnsAiSpectrum)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <ellipse
      cx="32"
      cy="32"
      rx="21"
      ry="9"
      transform="rotate(40 32 32)"
      stroke="url(#snnsAiSpectrum)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Radiant Quantum Nucleus */}
    <circle cx="32" cy="32" r="8" fill="#38BDF8" opacity="0.4" />
    <circle cx="32" cy="32" r="5" fill="#FFFFFF" />

    {/* North-South-East-West Sparkle Prisms */}
    <path d="M32 17L33.5 21L37.5 22.5L33.5 24L32 28L30.5 24L26.5 22.5L30.5 21L32 17Z" fill="#38BDF8" />
  </svg>
);

// 9. SNNS Smart Wi-Fi Printer / Cybernetic Precision Hardware
export const PrinterAppIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsPrinterBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B132B" />
        <stop offset="0.5" stopColor="#1C2541" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="snnsPaperLaser" x1="18" y1="36" x2="46" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0EA5E9" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Cyan Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsPrinterBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Wi-Fi Radiation Waves on Top */}
    <path d="M25 15C29 12 35 12 39 15" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
    <path d="M28 19C30 17.5 34 17.5 36 19" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" />
    <circle cx="32" cy="22" r="1.5" fill="#FFFFFF" />

    {/* Printer Sleek Industrial Chassis */}
    <rect x="12" y="24" width="40" height="22" rx="5" fill="#F8FAFC" />
    <rect x="15" y="27" width="34" height="4" rx="2" fill="#0F172A" />
    <circle cx="18" cy="29" r="1" fill="#22C55E" />
    <circle cx="22" cy="29" r="1" fill="#38BDF8" />

    {/* Printed Digital Hologram Sheet Ejecting */}
    <rect x="18" y="34" width="28" height="20" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
    <rect x="22" y="38" width="16" height="2" rx="1" fill="url(#snnsPaperLaser)" />
    <line x1="22" y1="43" x2="42" y2="43" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="22" y1="47" x2="36" y2="47" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 10. SNNS To Do / Kinetic Milestone Velocity
export const ToDoIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsTodoBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#172554" />
        <stop offset="0.5" stopColor="#1E40AF" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="snnsCheckGrad" x1="16" y1="32" x2="48" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#93C5FD" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Azure Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsTodoBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Kinetic Circular Target Portal */}
    <circle cx="32" cy="32" r="18" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />

    {/* Winged Lightning Checkmark Vector */}
    <path
      d="M18 33L28 43L47 19"
      stroke="url(#snnsCheckGrad)"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Glowing Milestone Star */}
    <circle cx="47" cy="19" r="3.5" fill="#FDE047" />
  </svg>
);

// 11. SNNS OneNote / Enchanted Digital Codex
export const OneNoteIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsNoteBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B0764" />
        <stop offset="0.5" stopColor="#581C87" />
        <stop offset="1" stopColor="#7E22CE" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Purple Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsNoteBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#C084FC" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Codex Folio Spine & Sheets */}
    <rect x="14" y="14" width="36" height="36" rx="5" fill="#4A044E" opacity="0.7" />
    <rect x="18" y="12" width="34" height="40" rx="5" fill="#FAF5FF" />
    <rect x="18" y="12" width="7" height="40" rx="2" fill="#7E22CE" />

    {/* Illuminated Golden Bookmark Ribbon */}
    <path d="M34 12V32L38 28L42 32V12H34Z" fill="#F59E0B" />

    {/* Handwriting Runes & Spiral */}
    <line x1="28" y1="20" x2="32" y2="20" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
    <line x1="28" y1="26" x2="32" y2="26" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
    <line x1="28" y1="36" x2="46" y2="36" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
    <line x1="28" y1="42" x2="42" y2="42" stroke="#E9D5FF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 12. SNNS Clipchamp / Cinema Studio Aperture
export const ClipchampIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsClipBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2E1065" />
        <stop offset="0.5" stopColor="#581C87" />
        <stop offset="1" stopColor="#9333EA" />
      </linearGradient>
      <linearGradient id="snnsPlayGrad" x1="24" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F472B6" />
        <stop offset="0.5" stopColor="#EC4899" />
        <stop offset="1" stopColor="#A855F7" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Neon Magenta Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsClipBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#F472B6" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* 35mm Holographic Filmstrip Segments */}
    <rect x="14" y="16" width="36" height="32" rx="6" fill="#18181B" stroke="#3F3F46" strokeWidth="1" />
    <circle cx="18" cy="20" r="1.5" fill="#E4E4E7" />
    <circle cx="24" cy="20" r="1.5" fill="#E4E4E7" />
    <circle cx="40" cy="20" r="1.5" fill="#E4E4E7" />
    <circle cx="46" cy="20" r="1.5" fill="#E4E4E7" />
    <circle cx="18" cy="44" r="1.5" fill="#E4E4E7" />
    <circle cx="24" cy="44" r="1.5" fill="#E4E4E7" />
    <circle cx="40" cy="44" r="1.5" fill="#E4E4E7" />
    <circle cx="46" cy="44" r="1.5" fill="#E4E4E7" />

    {/* Central Glowing Play Vector Crystal */}
    <polygon points="28,26 42,32 28,38" fill="url(#snnsPlayGrad)" />
    <polygon points="30,29 38,32 30,35" fill="#FFFFFF" />
  </svg>
);

// 13. SNNS Calendar / Chrono Time Portal
export const CalendarIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsCalBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#082F49" />
        <stop offset="0.5" stopColor="#0369A1" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Azure Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsCalBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Floating Chrono Card */}
    <rect x="14" y="16" width="36" height="36" rx="6" fill="#F8FAFC" />
    <path d="M14 16C14 12.7 16.7 10 20 10H44C47.3 10 50 12.7 50 16V24H14V16Z" fill="#0284C7" />

    {/* Dual Gold Fastener Studs */}
    <rect x="22" y="8" width="4" height="7" rx="2" fill="#FDE047" />
    <rect x="38" y="8" width="4" height="7" rx="2" fill="#FDE047" />

    {/* Active Target Day Cell Highlight */}
    <circle cx="32" cy="36" r="6" fill="#0284C7" />
    <text x="32" y="39.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">
      26
    </text>

    {/* Neighboring Calendar Cells */}
    <circle cx="22" cy="30" r="2" fill="#94A3B8" />
    <circle cx="32" cy="30" r="2" fill="#94A3B8" />
    <circle cx="42" cy="30" r="2" fill="#94A3B8" />
    <circle cx="22" cy="42" r="2" fill="#CBD5E1" />
    <circle cx="42" cy="42" r="2" fill="#CBD5E1" />
  </svg>
);

// 14. SNNS Forms / Interactive Polling Matrix
export const FormsSurveyIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsFormsBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#042F2E" />
        <stop offset="0.5" stopColor="#115E59" />
        <stop offset="1" stopColor="#0D9488" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Teal Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsFormsBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#2DD4BF" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Polling Matrix Clipboard Body */}
    <rect x="16" y="14" width="32" height="38" rx="6" fill="#F0FDFA" />
    <rect x="24" y="10" width="16" height="5" rx="2" fill="#0F766E" />

    {/* Checked Interactive Radio Options */}
    <circle cx="23" cy="24" r="3.5" fill="#0D9488" />
    <circle cx="23" cy="24" r="1.5" fill="#FFFFFF" />
    <line x1="30" y1="24" x2="42" y2="24" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" />

    <circle cx="23" cy="33" r="3.5" fill="#CCFBF1" stroke="#0D9488" strokeWidth="1.5" />
    <line x1="30" y1="33" x2="44" y2="33" stroke="#5EEAD4" strokeWidth="2" strokeLinecap="round" />

    <circle cx="23" cy="42" r="3.5" fill="#CCFBF1" stroke="#0D9488" strokeWidth="1.5" />
    <line x1="30" y1="42" x2="38" y2="42" stroke="#5EEAD4" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 15. SNNS Designer / Prismatic Atelier
export const DesignerIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsDesignBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4A044E" />
        <stop offset="0.5" stopColor="#831843" />
        <stop offset="1" stopColor="#BE185D" />
      </linearGradient>
      <linearGradient id="snnsPrismWheel" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F43F5E" />
        <stop offset="0.3" stopColor="#FB923C" />
        <stop offset="0.6" stopColor="#FACC15" />
        <stop offset="0.8" stopColor="#38BDF8" />
        <stop offset="1" stopColor="#A855F7" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Magenta Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsDesignBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#F472B6" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Intersecting Creative Light Polyhedron */}
    <path
      d="M32 14L46 22L46 42L32 50L18 42L18 22L32 14Z"
      fill="url(#snnsPrismWheel)"
      opacity="0.9"
    />
    <circle cx="32" cy="32" r="7" fill="#FFFFFF" />
    <circle cx="32" cy="32" r="3.5" fill="#BE185D" />
  </svg>
);

// 16. SNNS Family Safety / Sovereign Aegis Shield
export const FamilySafetyIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsShieldBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#064E3B" />
        <stop offset="0.5" stopColor="#047857" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Emerald Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsShieldBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#34D399" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Sovereign Protective Aegis Crest */}
    <path
      d="M32 12L48 18V32C48 42 41 49 32 53C23 49 16 42 16 32V18L32 12Z"
      fill="#064E3B"
      stroke="#6EE7B7"
      strokeWidth="2"
    />

    {/* Inner Heart & Family Care Core */}
    <path
      d="M32 23C30 20 25 20 23 23C21 26 21 29 23 32L32 40L41 32C43 29 43 26 41 23C39 20 34 20 32 23Z"
      fill="#34D399"
    />
    <circle cx="32" cy="27" r="2.5" fill="#FFFFFF" />
  </svg>
);

// 17. SNNS Skype / Sovereign Acoustic Telephony
export const SkypeIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsSkypeBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#082F49" />
        <stop offset="0.5" stopColor="#0284C7" />
        <stop offset="1" stopColor="#0EA5E9" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Sky Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsSkypeBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Acoustic Soundwave Concentric Ripples */}
    <circle cx="26" cy="38" r="8" fill="#0369A1" opacity="0.6" />
    <circle cx="38" cy="26" r="8" fill="#0369A1" opacity="0.6" />

    {/* Smooth Calling Wave Vector */}
    <path
      d="M26 24C26 21.5 28.5 20 32 20C35.5 20 38 21.5 38 24C38 26.5 35 28 32 29C29 30 26 31.5 26 34C26 37.5 29 39 32 39C36 39 38 37.5 38 35"
      stroke="#FFFFFF"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);

// 18. SNNS More Apps / Constellation Hub
export const MoreAppsIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsMoreBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F172A" />
        <stop offset="0.5" stopColor="#1E293B" />
        <stop offset="1" stopColor="#334155" />
      </linearGradient>
    </defs>

    {/* Squircle Base with Slate Glass Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsMoreBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#64748B" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* 4 Connected Holographic Diamond Constellation Nodes */}
    <rect x="18" y="18" width="10" height="10" rx="3" fill="#38BDF8" />
    <rect x="36" y="18" width="10" height="10" rx="3" fill="#818CF8" />
    <rect x="18" y="36" width="10" height="10" rx="3" fill="#34D399" />
    <rect x="36" y="36" width="10" height="10" rx="3" fill="#F472B6" />

    {/* Interconnect Vectors */}
    <line x1="28" y1="23" x2="36" y2="23" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="23" y1="28" x2="23" y2="36" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="41" y1="28" x2="41" y2="36" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="28" y1="41" x2="36" y2="41" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
  </svg>
);

// 19. SNNS Marketplace / Neo-Prismatic Commercial Exchange
export const MarketplaceIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsMarketBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#78350F" />
        <stop offset="0.5" stopColor="#D97706" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="snnsMarketTag" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFBEB" />
        <stop offset="0.7" stopColor="#FDE68A" />
        <stop offset="1" stopColor="#FCD34D" />
      </linearGradient>
    </defs>
    {/* Squircle Base with Gold Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsMarketBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.5" />

    {/* Store Canopy Roof */}
    <path
      d="M16 26L32 16L48 26H16Z"
      fill="#FBBF24"
      stroke="#78350F"
      strokeWidth="1.5"
    />
    {/* Storefront Columns & Base */}
    <rect x="18" y="26" width="28" height="22" rx="3" fill="url(#snnsMarketTag)" />
    <rect x="22" y="32" width="6" height="12" rx="2" fill="#D97706" />
    <rect x="36" y="32" width="6" height="12" rx="2" fill="#D97706" />
    {/* Verified Price Tag Sparkle */}
    <circle cx="32" cy="22" r="3" fill="#FFFFFF" />
    <path d="M30 36L34 40M34 36L30 40" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 20. SNNS Business / Corporate Directory & Enterprises
export const BusinessIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsBizBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E1B4B" />
        <stop offset="0.5" stopColor="#312E81" />
        <stop offset="1" stopColor="#4338CA" />
      </linearGradient>
    </defs>
    {/* Squircle Base with Indigo Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsBizBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#818CF8" strokeWidth="1.5" strokeOpacity="0.5" />

    {/* Modern Skyscraper Left */}
    <rect x="16" y="24" width="14" height="26" rx="2" fill="#4F46E5" />
    <rect x="19" y="28" width="3" height="3" rx="0.5" fill="#E0E7FF" />
    <rect x="24" y="28" width="3" height="3" rx="0.5" fill="#E0E7FF" />
    <rect x="19" y="34" width="3" height="3" rx="0.5" fill="#E0E7FF" />
    <rect x="24" y="34" width="3" height="3" rx="0.5" fill="#E0E7FF" />
    <rect x="19" y="40" width="3" height="3" rx="0.5" fill="#E0E7FF" />
    <rect x="24" y="40" width="3" height="3" rx="0.5" fill="#E0E7FF" />

    {/* Primary Skyscraper Right (Taller) */}
    <rect x="32" y="16" width="16" height="34" rx="2.5" fill="#6366F1" />
    <rect x="36" y="21" width="3.5" height="3.5" rx="0.5" fill="#FFFFFF" />
    <rect x="42" y="21" width="3.5" height="3.5" rx="0.5" fill="#FFFFFF" />
    <rect x="36" y="28" width="3.5" height="3.5" rx="0.5" fill="#FFFFFF" />
    <rect x="42" y="28" width="3.5" height="3.5" rx="0.5" fill="#FFFFFF" />
    <rect x="36" y="35" width="3.5" height="3.5" rx="0.5" fill="#FFFFFF" />
    <rect x="42" y="35" width="3.5" height="3.5" rx="0.5" fill="#FFFFFF" />
    <rect x="36" y="42" width="3.5" height="3.5" rx="0.5" fill="#FFFFFF" />
    <rect x="42" y="42" width="3.5" height="3.5" rx="0.5" fill="#FFFFFF" />

    {/* Golden Verified Badge Accent */}
    <circle cx="46" cy="18" r="4.5" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="1" />
    <path d="M44.5 18L45.5 19L47.5 17" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 21. SNNS Account / Central Identity & Security Hub
export const AccountIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="snnsAccBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F172A" />
        <stop offset="0.5" stopColor="#1E293B" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    {/* Squircle Base with Cyan Trim */}
    <rect width="64" height="64" rx="16" fill="url(#snnsAccBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.5" />

    {/* Sovereign User Avatar / Shield Silhouette */}
    <circle cx="32" cy="24" r="8" fill="#38BDF8" />
    <path
      d="M20 44C20 37.3726 25.3726 32 32 32C38.6274 32 44 37.3726 44 44V46H20V44Z"
      fill="#0284C7"
    />
    {/* Biometric Shield Ring */}
    <circle cx="32" cy="32" r="18" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
  </svg>
);

// 22. QAYD POS — Cashier & Point of Sale System
export const QaydPosIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="qaydPosBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#064E3B" />
        <stop offset="0.5" stopColor="#047857" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="posScreenGrad" x1="18" y1="14" x2="46" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F172A" />
        <stop offset="1" stopColor="#1E293B" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#qaydPosBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#34D399" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* POS Stand / Base */}
    <path d="M22 47H42L40 43H24L22 47Z" fill="#D1D5DB" />
    <path d="M20 48H44C44.5523 48 45 48.4477 45 49V51C45 51.5523 44.5523 52 44 52H20C19.4477 52 19 51.5523 19 51V49C19 48.4477 19.4477 48 20 48Z" fill="#9CA3AF" />

    {/* Terminal Main Body */}
    <rect x="16" y="14" width="32" height="28" rx="4" fill="url(#posScreenGrad)" stroke="#E2E8F0" strokeWidth="1.5" />

    {/* Screen Display */}
    <rect x="19" y="17" width="26" height="15" rx="2" fill="#022C22" />
    {/* Barcode / Invoice Lines on Screen */}
    <line x1="22" y1="21" x2="33" y2="21" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="22" y1="25" x2="30" y2="25" stroke="#6EE7B7" strokeWidth="1.2" strokeLinecap="round" />
    <rect x="36" y="20" width="6" height="6" rx="1" fill="#F59E0B" />

    {/* Keypad & Card Reader Slot */}
    <rect x="19" y="34" width="5" height="4" rx="1" fill="#4B5563" />
    <rect x="26" y="34" width="5" height="4" rx="1" fill="#4B5563" />
    <rect x="33" y="34" width="5" height="4" rx="1" fill="#4B5563" />
    <rect x="40" y="34" width="5" height="4" rx="1" fill="#10B981" />

    {/* Laser Scan Beam */}
    <line x1="14" y1="12" x2="50" y2="12" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="3 2" />
  </svg>
);

// 23. QAYD Accounting — Financial & Ledger Suite
export const QaydAccountingIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="qaydAccBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F172A" />
        <stop offset="0.6" stopColor="#1E3A8A" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#qaydAccBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Ledger Book & Calculations */}
    <rect x="16" y="16" width="32" height="34" rx="3" fill="#FFFFFF" />
    <rect x="16" y="16" width="6" height="34" rx="1" fill="#2563EB" />
    <line x1="26" y1="23" x2="42" y2="23" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="28" x2="38" y2="28" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="26" y1="33" x2="43" y2="33" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

    {/* Currency / Growth Scale Badge */}
    <circle cx="39" cy="40" r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M36 40H42M39 37V43" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 24. SNNS Education — Unified Academy & Learning
export const EducationIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="eduBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#064E3B" />
        <stop offset="0.5" stopColor="#065F46" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#eduBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#6EE7B7" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Graduation Cap */}
    <path d="M32 18L16 26L32 34L48 26L32 18Z" fill="#F8FAFC" />
    <path d="M22 30V38C22 42 26.5 45 32 45C37.5 45 42 42 42 38V30L32 35L22 30Z" fill="#E2E8F0" />
    {/* Tassel */}
    <path d="M44 28V38" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <circle cx="44" cy="39" r="1.5" fill="#F59E0B" />
  </svg>
);

// 25. SNNS Calls — Crystal Audio & Video Meetings
export const CallsIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="callsBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#064E3B" />
        <stop offset="0.5" stopColor="#0284C7" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#callsBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Video Camera & Audio Wave */}
    <rect x="18" y="22" width="20" height="20" rx="4" fill="#FFFFFF" />
    <path d="M38 27L46 22V42L38 37V27Z" fill="#E0F2FE" />
    <circle cx="28" cy="32" r="4" fill="#0284C7" />
  </svg>
);

// 26. SNNS Chat — Instant Messaging & Channels
export const ChatIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="chatBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E1B4B" />
        <stop offset="0.5" stopColor="#4338CA" />
        <stop offset="1" stopColor="#6366F1" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#chatBg)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="#818CF8" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Chat Bubbles */}
    <path d="M18 20C18 17.7909 19.7909 16 22 16H42C44.2091 16 46 17.7909 46 20V32C46 34.2091 44.2091 36 42 36H26L18 42V20Z" fill="#FFFFFF" />
    <circle cx="26" cy="26" r="2.5" fill="#4F46E5" />
    <circle cx="32" cy="26" r="2.5" fill="#4F46E5" />
    <circle cx="38" cy="26" r="2.5" fill="#4F46E5" />
  </svg>
);

// 27. Saudi Flag Emblem
export const SaudiFlagIcon: React.FC<IconProps> = ({ className = 'w-8 h-8', size }) => (
  <svg
    viewBox="0 0 64 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <rect width="64" height="48" rx="4" fill="#006C35" />
    {/* Stylized Palm Tree & Crossed Swords */}
    <path d="M32 10C30 15 28 18 28 22H36C36 18 34 15 32 10Z" fill="#FFFFFF" />
    <path d="M32 22V32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    {/* Curved Crossed Swords */}
    <path d="M22 36C26 33 38 33 42 36" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M22 33C26 36 38 36 42 33" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

