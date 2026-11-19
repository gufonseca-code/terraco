/**
 * Architectural SVG layers for the Terraço hero facade (viewBox 0 0 720 1280).
 * Measured directly against mp4_frame_0.png (720x1280).
 *
 * Exported as two layers so potted foliage sits between them in natural z-order:
 *  1. FacadeBackdrop            — canvas, recessed walls, diagonal shadows, doors/shutters/windows
 *  2. FacadeForegroundStructure — balcony railings/balusters, center pillar, concrete slabs & bevels
 */

// Baluster x-positions measured from mp4_frame_0.png
// Left bay: corner post at x=73, then 21 vertical balusters across x=90.5..417.5
const LEFT_BALUSTERS: number[] = [
  90.5, 108, 125, 142, 159, 175.5, 192, 208, 224, 240, 256, 272, 288, 304,
  320, 336, 352, 368, 384, 400.5, 417.5,
];

// Right bay: 14 vertical balusters at 18.5px spacing from x=474.5..715
const RIGHT_BALUSTERS: number[] = Array.from(
  { length: 14 },
  (_, i) => 474.5 + i * 18.5
);

// Louver slat y-offsets for the Coral Goiaba shutters
const F2_SHUTTER_SLATS: number[] = Array.from(
  { length: 25 },
  (_, i) => 486 + i * 8.6
);
const F3_SHUTTER_SLATS: number[] = Array.from(
  { length: 28 },
  (_, i) => 816 + i * 8.4
);

function CoralShutters({
  idPrefix,
  x,
  y,
  height,
  diagLeftY,
  diagRightY,
  slats,
}: {
  idPrefix: string;
  x: number;
  y: number;
  height: number;
  diagLeftY: number;
  diagRightY: number;
  slats: number[];
}) {
  const width = 164;
  const frame = 6;
  const stileX = x + 78;
  const stileW = 8;
  const leftPanelX = x + frame;
  const leftPanelW = stileX - leftPanelX;
  const rightPanelX = stileX + stileW;
  const rightPanelW = x + width - frame - rightPanelX;
  const innerY = y + frame;
  const innerH = height - frame;
  const clipId = `${idPrefix}-sunlit-clip`;

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <polygon
            points={`${x},${diagLeftY} ${x + width},${diagRightY} ${x + width},${y + height} ${x},${y + height}`}
          />
        </clipPath>
      </defs>

      {/* Outer terracotta-brown shutter frame (shaded) */}
      <rect x={x} y={y} width={width} height={height} fill="#7D4C32" />

      {/* Inner recessed louvered panels — shaded base */}
      <rect
        x={leftPanelX}
        y={innerY}
        width={leftPanelW}
        height={innerH}
        fill="#BE7356"
      />
      <rect
        x={rightPanelX}
        y={innerY}
        width={rightPanelW}
        height={innerH}
        fill="#BE7356"
      />

      {/* Center vertical stile — shaded */}
      <rect x={stileX} y={y + 4} width={stileW} height={height - 4} fill="#955034" />
      <line
        x1={stileX + stileW / 2}
        y1={y + 4}
        x2={stileX + stileW / 2}
        y2={y + height}
        stroke="#733B24"
        strokeWidth="1.2"
      />

      {/* Louver slats — shaded zone */}
      <g stroke="#965038" strokeWidth="1.8">
        {slats.map((sy) => (
          <g key={`${idPrefix}-sh-${sy}`}>
            <line x1={leftPanelX + 2} y1={sy} x2={leftPanelX + leftPanelW - 2} y2={sy} />
            <line x1={rightPanelX + 2} y1={sy} x2={rightPanelX + rightPanelW - 2} y2={sy} />
          </g>
        ))}
      </g>

      {/* Sunlit lower-left diagonal zone */}
      <g clipPath={`url(#${clipId})`}>
        {/* Sunlit frame tint */}
        <rect x={x} y={y} width={width} height={height} fill="#9B5B3E" />

        {/* Sunlit Coral Goiaba panels */}
        <rect
          x={leftPanelX}
          y={innerY}
          width={leftPanelW}
          height={innerH}
          fill="#F1966D"
        />
        <rect
          x={rightPanelX}
          y={innerY}
          width={rightPanelW}
          height={innerH}
          fill="#F1966D"
        />

        {/* Sunlit center stile */}
        <rect
          x={stileX}
          y={y + 4}
          width={stileW}
          height={height - 4}
          fill="#C57352"
        />
        <line
          x1={stileX + stileW / 2}
          y1={y + 4}
          x2={stileX + stileW / 2}
          y2={y + height}
          stroke="#964F33"
          strokeWidth="1.2"
        />

        {/* Sunlit louver slats */}
        <g stroke="#C76F4B" strokeWidth="1.8">
          {slats.map((sy) => (
            <g key={`${idPrefix}-su-${sy}`}>
              <line x1={leftPanelX + 2} y1={sy} x2={leftPanelX + leftPanelW - 2} y2={sy} />
              <line x1={rightPanelX + 2} y1={sy} x2={rightPanelX + rightPanelW - 2} y2={sy} />
            </g>
          ))}
        </g>
      </g>

      {/* Crisp inner frame recess lines */}
      <rect
        x={x + 1}
        y={y + 1}
        width={width - 2}
        height={height - 1}
        fill="none"
        stroke="#6B3E26"
        strokeWidth="1.5"
        opacity="0.55"
      />
    </g>
  );
}

function RightSlidingGlassDoor({
  y,
  height,
  reflYLeft,
  reflYRight,
}: {
  y: number;
  height: number;
  reflYLeft: number;
  reflYRight: number;
}) {
  const x = 541;
  const width = 167;
  const frame = 7;
  const mullionX = 621;
  const mullionW = 8;

  return (
    <g>
      {/* Outer dark espresso-olive frame */}
      <rect x={x} y={y} width={width} height={height} fill="#423726" />

      {/* Left glass pane (dark forest green) */}
      <rect
        x={x + frame}
        y={y + frame}
        width={mullionX - (x + frame)}
        height={height - frame}
        fill="#344D3B"
      />

      {/* Right glass pane (dark forest green) */}
      <rect
        x={mullionX + mullionW}
        y={y + frame}
        width={x + width - frame - (mullionX + mullionW)}
        height={height - frame}
        fill="#334B3A"
      />

      {/* Subtle diagonal glass reflection */}
      <polygon
        points={`${x + frame},${reflYLeft} ${x + width - frame},${reflYRight} ${x + width - frame},${y + height} ${x + frame},${y + height}`}
        fill="#4A604E"
        opacity="0.45"
      />

      {/* Center vertical mullion */}
      <rect x={mullionX} y={y + 4} width={mullionW} height={height - 4} fill="#3A3D2D" />
      <line
        x1={mullionX + 1}
        y1={y + 4}
        x2={mullionX + 1}
        y2={y + height}
        stroke="#2C2E21"
        strokeWidth="1"
      />
    </g>
  );
}

function RailingBay({
  yTop,
  yInner,
  yBottom,
  ySlabTop,
}: {
  yTop: number;
  yInner: number;
  yBottom: number;
  ySlabTop: number;
}) {
  return (
    <g stroke="#493A29" strokeLinecap="butt" fill="none">
      {/* === LEFT BAY RAILING (x=72..432) === */}
      {/* Top handrail */}
      <line x1={72} y1={yTop + 2} x2={432} y2={yTop + 2} strokeWidth={4.2} />
      {/* Upper inner bar */}
      <line x1={72} y1={yInner + 1} x2={432} y2={yInner + 1} strokeWidth={2.4} />
      {/* Bottom rail */}
      <line x1={72} y1={yBottom + 1} x2={432} y2={yBottom + 1} strokeWidth={2.8} />
      {/* Left corner post extending down to rest on concrete slab */}
      <line x1={73.5} y1={yTop} x2={73.5} y2={ySlabTop} strokeWidth={3.4} />

      {/* Left bay vertical balusters */}
      {LEFT_BALUSTERS.map((bx) => (
        <line
          key={`lb-${yTop}-${bx}`}
          x1={bx}
          y1={yInner + 1}
          x2={bx}
          y2={yBottom + 1}
          strokeWidth={2.1}
        />
      ))}

      {/* === RIGHT BAY RAILING (x=454..720) === */}
      {/* Top handrail */}
      <line x1={454} y1={yTop + 2} x2={720} y2={yTop + 2} strokeWidth={4.2} />
      {/* Upper inner bar */}
      <line x1={454} y1={yInner + 1} x2={720} y2={yInner + 1} strokeWidth={2.4} />
      {/* Bottom rail */}
      <line x1={454} y1={yBottom + 1} x2={720} y2={yBottom + 1} strokeWidth={2.8} />

      {/* Right bay vertical balusters */}
      {RIGHT_BALUSTERS.map((bx) => (
        <line
          key={`rb-${yTop}-${bx}`}
          x1={bx}
          y1={yInner + 1}
          x2={bx}
          y2={yBottom + 1}
          strokeWidth={2.1}
        />
      ))}
    </g>
  );
}

/**
 * Layer 1 (behind balcony foliage):
 * Canvas background, left sunlit walls, recessed inner back & side walls,
 * diagonal sunlight/shadow wedges on every floor, and all doors/shutters/windows.
 */
export function FacadeBackdrop() {
  return (
    <g id="facade-backdrop">
      <defs>
        <clipPath id="facade-f1-yellow-sunlit">
          <polygon points="208,162 363,256 363,373 208,373" />
        </clipPath>
      </defs>

      {/* Warm ivory canvas background */}
      <rect x={0} y={0} width={720} height={1280} fill="#F9F5EF" />

      {/* ================================================================== */}
      {/* FLOOR 1 (y = 72 .. 373)                                            */}
      {/* ================================================================== */}
      {/* Left bay recessed back wall — shaded upper base */}
      <rect x={112} y={72} width={320} height={301} fill="#DFCCAC" />
      {/* Left sunlit side wall wedge (below overhang shadow diagonal) */}
      <polygon points="112,98 202,152 202,373 112,373" fill="#FBEDC6" />
      {/* Left bay sunlit back wall (lower-right below horizontal/angled shadow) */}
      <polygon points="202,248 432,252 432,373 202,373" fill="#F7EDCA" />

      {/* Floor 1 Left: Yellow Ipê Door (x=208..363, y=151..373) */}
      <g id="f1-yellow-ipe-door">
        {/* Subtle outer frame trim */}
        <rect x={206} y={150} width={159} height={223} fill="#D9B477" />
        {/* Shaded yellow upper panels */}
        <rect x={208} y={151} width={155} height={222} fill="#CC9323" />
        {/* Shaded dark espresso vertical stripe */}
        <rect x={293} y={151} width={32} height={222} fill="#2E271C" />

        {/* Sunlit lower-left diagonal split */}
        <g clipPath="url(#facade-f1-yellow-sunlit)">
          <rect x={208} y={151} width={155} height={222} fill="#F5B826" />
          {/* Slight vertical shadow on left door jamb */}
          <rect x={208} y={151} width={24} height={222} fill="#E4A824" />
          {/* Sunlit dark espresso vertical stripe */}
          <rect x={293} y={151} width={32} height={222} fill="#403324" />
        </g>

        {/* Subtle warm plant/railing cast shadow near lower-left of yellow door */}
        <polygon
          points="232,324 275,342 293,373 232,373"
          fill="#CE9424"
          opacity="0.32"
        />
      </g>

      {/* Floor 1 Right bay recessed walls */}
      <rect x={454} y={72} width={24} height={301} fill="#C8A982" />
      <rect x={478} y={72} width={242} height={301} fill="#D3B79A" />

      {/* Floor 1 Right: Dark green sliding glass door */}
      <RightSlidingGlassDoor y={145} height={228} reflYLeft={296} reflYRight={212} />

      {/* ================================================================== */}
      {/* FLOOR 2 (y = 400 .. 705)                                           */}
      {/* ================================================================== */}
      {/* Left bay recessed back wall — shaded upper base */}
      <rect x={112} y={400} width={320} height={305} fill="#CCAE92" />
      {/* Left sunlit side wall wedge */}
      <polygon points="112,434 198,477 198,705 112,705" fill="#FBEDC2" />
      {/* Left bay sunlit back wall (lower-right) */}
      <polygon points="362,565 432,574 432,705 198,705 198,565" fill="#F8EEC7" />

      {/* Floor 2 Left: Coral Goiaba Louvered Shutters */}
      <CoralShutters
        idPrefix="f2-shutter"
        x={198}
        y={477}
        height={228}
        diagLeftY={494}
        diagRightY={586}
        slats={F2_SHUTTER_SLATS}
      />

      {/* Floor 2 Right bay recessed walls */}
      <rect x={454} y={400} width={24} height={305} fill="#C6A988" />
      <rect x={478} y={400} width={242} height={305} fill="#D5BD9F" />

      {/* Floor 2 Right: Dark green sliding glass door */}
      <RightSlidingGlassDoor y={477} height={228} reflYLeft={622} reflYRight={545} />

      {/* ================================================================== */}
      {/* FLOOR 3 (y = 732 .. 1054)                                          */}
      {/* ================================================================== */}
      {/* Left bay recessed back wall — shaded upper base */}
      <rect x={112} y={732} width={320} height={322} fill="#D0B498" />
      {/* Left sunlit side wall wedge */}
      <polygon points="112,765 196,807 196,1054 112,1054" fill="#FBECC2" />
      {/* Left bay sunlit back wall (lower-right) */}
      <polygon points="362,899 432,908 432,1054 196,1054 196,899" fill="#F8EEC8" />

      {/* Floor 3 Left: Coral Goiaba Louvered Shutters */}
      <CoralShutters
        idPrefix="f3-shutter"
        x={196}
        y={807}
        height={247}
        diagLeftY={822}
        diagRightY={914}
        slats={F3_SHUTTER_SLATS}
      />

      {/* Floor 3 Right bay recessed walls */}
      <rect x={454} y={732} width={24} height={322} fill="#C7AA87" />
      <rect x={478} y={732} width={242} height={322} fill="#D5BB9E" />

      {/* Floor 3 Right: Dark green sliding glass door */}
      <RightSlidingGlassDoor y={806} height={248} reflYLeft={960} reflYRight={882} />

      {/* ================================================================== */}
      {/* FLOOR 4 — BOTTOM GROUND LEVEL (y = 1083 .. 1280)                   */}
      {/* ================================================================== */}
      {/* Left bay recessed back wall — shaded */}
      <rect x={102} y={1083} width={330} height={197} fill="#CFB79A" />
      {/* Left sunlit side wall wedge */}
      <polygon points="102,1104 195,1154 195,1280 102,1280" fill="#FAEAC0" />
      {/* Subtle sunlit sliver bottom-right next to door */}
      <polygon points="368,1264 398,1280 368,1280" fill="#F6E8C2" />

      {/* Floor 4 Left: Dark green glass door/window (x=195..368, y=1126..1280) */}
      <g id="f4-green-glass-door">
        {/* Outer frame */}
        <rect x={195} y={1126} width={173} height={154} fill="#3E3626" />
        {/* Left glass pane */}
        <rect x={203} y={1134} width={75} height={146} fill="#334C3C" />
        {/* Right glass pane */}
        <rect x={286} y={1134} width={74} height={146} fill="#334C3C" />
        {/* Diagonal sunlight reflection across lower-left glass */}
        <polygon
          points="203,1164 360,1258 360,1280 203,1280"
          fill="#4B6350"
        />
        {/* Center vertical mullion */}
        <rect x={278} y={1130} width={8} height={150} fill="#3B3829" />
      </g>

      {/* Floor 4 Right bay recessed walls (partially behind foreground monstera) */}
      <rect x={454} y={1083} width={24} height={197} fill="#C4A886" />
      <rect x={478} y={1083} width={242} height={197} fill="#D2B89B" />
    </g>
  );
}

/**
 * Layer 2 (in front of balcony foliage):
 * All 3 balcony railings & balusters, center vertical structural pillar,
 * and all 4 concrete floor slabs with angled underside bevels and subtle shadow lines.
 */
export function FacadeForegroundStructure() {
  return (
    <g id="facade-foreground-structure">
      {/* ================================================================== */}
      {/* ALL 3 BALCONY RAILINGS                                             */}
      {/* ================================================================== */}
      {/* Floor 1 railing */}
      <RailingBay yTop={246} yInner={262} yBottom={361} ySlabTop={373} />
      {/* Floor 2 railing */}
      <RailingBay yTop={585} yInner={600} yBottom={693} ySlabTop={705} />
      {/* Floor 3 railing */}
      <RailingBay yTop={931} yInner={947} yBottom={1043} ySlabTop={1054} />

      {/* ================================================================== */}
      {/* CENTER VERTICAL STRUCTURAL PILLAR (x = 432 .. 454, y = 47 .. 1280) */}
      {/* ================================================================== */}
      <rect x={432} y={47} width={22} height={1233} fill="#FCF3D8" />
      {/* Subtle warm shadow along right edge of pillar where it meets right recess */}
      <line
        x1={454}
        y1={72}
        x2={454}
        y2={1280}
        stroke="#C5B08E"
        strokeWidth={1.2}
      />

      {/* ================================================================== */}
      {/* CONCRETE SLAB 1 — TOP ROOF (y = 47 .. 72, bevel 72 .. 100)         */}
      {/* ================================================================== */}
      {/* Left bay underside bevel */}
      <polygon points="81,72 432,72 432,100 112,100" fill="#CDAE89" />
      {/* Right bay underside bevel */}
      <polygon points="454,72 720,72 720,100 478,100" fill="#B18E6A" />
      {/* Front face */}
      <rect x={81} y={47} width={639} height={25} fill="#FAF3DB" />
      {/* Subtle bottom drip shadow line */}
      <line x1={81} y1={72.5} x2={432} y2={72.5} stroke="#B89B78" strokeWidth={1.4} />
      <line x1={454} y1={72.5} x2={720} y2={72.5} stroke="#9D7D5B" strokeWidth={1.4} />

      {/* ================================================================== */}
      {/* CONCRETE SLAB 2 — FLOOR 1 FLOOR (y = 373 .. 400, bevel 400 .. 435) */}
      {/* ================================================================== */}
      {/* Left bay underside bevel */}
      <polygon points="56,400 432,400 432,435 112,435" fill="#B48F6B" />
      {/* Right bay underside bevel */}
      <polygon points="454,400 720,400 720,435 478,435" fill="#B28E6A" />
      {/* Front face */}
      <rect x={56} y={373} width={664} height={27} fill="#FCF2D6" />
      {/* Subtle top floor lip & bottom drip shadow lines */}
      <line x1={56} y1={373.5} x2={720} y2={373.5} stroke="#EAE0C2" strokeWidth={1} />
      <line x1={56} y1={400.5} x2={432} y2={400.5} stroke="#9F7E5C" strokeWidth={1.5} />
      <line x1={454} y1={400.5} x2={720} y2={400.5} stroke="#9A7A58" strokeWidth={1.5} />

      {/* ================================================================== */}
      {/* CONCRETE SLAB 3 — FLOOR 2 FLOOR (y = 705 .. 732, bevel 732 .. 766) */}
      {/* ================================================================== */}
      {/* Left bay underside bevel */}
      <polygon points="56,732 432,732 432,766 112,766" fill="#B2916C" />
      {/* Right bay underside bevel */}
      <polygon points="454,732 720,732 720,766 478,766" fill="#B1906B" />
      {/* Front face */}
      <rect x={56} y={705} width={664} height={27} fill="#FBF2D3" />
      {/* Subtle top floor lip & bottom drip shadow lines */}
      <line x1={56} y1={705.5} x2={720} y2={705.5} stroke="#EAE0C0" strokeWidth={1} />
      <line x1={56} y1={732.5} x2={432} y2={732.5} stroke="#9D7D5C" strokeWidth={1.5} />
      <line x1={454} y1={732.5} x2={720} y2={732.5} stroke="#997958" strokeWidth={1.5} />

      {/* ================================================================== */}
      {/* CONCRETE SLAB 4 — FLOOR 3 FLOOR (y = 1054 .. 1083, bevel 1083..1105) */}
      {/* ================================================================== */}
      {/* Underside shadow band below Slab 4 */}
      <polygon points="102,1083 432,1083 432,1105 102,1105" fill="#D0B79B" />
      <polygon points="454,1083 720,1083 720,1105 478,1105" fill="#C4A886" />
      {/* Front face */}
      <rect x={56} y={1054} width={664} height={29} fill="#FDF1D5" />
      {/* Subtle top floor lip & bottom shadow line */}
      <line x1={56} y1={1054.5} x2={720} y2={1054.5} stroke="#EAE0C2" strokeWidth={1} />
      <line x1={56} y1={1083.5} x2={720} y2={1083.5} stroke="#B89F81" strokeWidth={1.4} />
    </g>
  );
}
