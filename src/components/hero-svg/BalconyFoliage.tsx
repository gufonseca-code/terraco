interface PotProps {
  x: number;
  y: number;
  w: number;
  h: number;
  lightFill: string;
  darkFill: string;
  rimFill?: string;
}

function ClayPot({ x, y, w, h, lightFill, darkFill, rimFill }: PotProps) {
  const inset = Math.round(w * 0.1);
  const r = 6;
  const xL = x;
  const xR = x + w;
  const yB = y + h;
  const xBL = x + inset;
  const xBR = x + w - inset;
  const midX = x + w * 0.56;

  return (
    <g>
      <path
        d={`M ${xL} ${y} L ${xR} ${y} L ${xBR} ${yB - r} Q ${xBR - 1} ${yB} ${xBR - r} ${yB} L ${xBL + r} ${yB} Q ${xBL + 1} ${yB} ${xBL} ${yB - r} Z`}
        fill={lightFill}
      />
      <path
        d={`M ${midX} ${y} L ${xR} ${y} L ${xBR} ${yB - r} Q ${xBR - 1} ${yB} ${xBR - r} ${yB} L ${midX - 4} ${yB} Z`}
        fill={darkFill}
      />
      {rimFill && (
        <rect
          x={xL - 1}
          y={y}
          width={w + 2}
          height={4.5}
          rx={1.5}
          fill={rimFill}
          opacity={0.45}
        />
      )}
    </g>
  );
}

/**
 * Small pointed oval leaf for dense rounded bushes.
 */
function BushLeaf({
  x,
  y,
  r,
  s = 1,
  fill,
}: {
  x: number;
  y: number;
  r: number;
  s?: number;
  fill: string;
}) {
  return (
    <path
      d="M 0 0 C -4 -4 -4.5 -10 0 -15 C 4.5 -10 4 -4 0 0 Z"
      fill={fill}
      transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
    />
  );
}

// Dense rounded dome of small pointed leaves for F2 & F3 left companion bush
const LOWER_BUSH_LEAVES: Array<[number, number, number, number, string]> = [
  // Back dark silhouette layer
  [184, 658, -72, 1.15, "#264021"],
  [182, 646, -56, 1.2, "#264021"],
  [190, 634, -40, 1.25, "#264021"],
  [200, 624, -22, 1.25, "#264021"],
  [212, 618, -4, 1.25, "#264021"],
  [224, 622, 18, 1.2, "#264021"],
  [235, 630, 38, 1.2, "#264021"],
  [244, 642, 58, 1.2, "#264021"],
  [248, 656, 78, 1.15, "#264021"],
  [180, 668, -98, 1.1, "#264021"],
  [246, 668, 96, 1.1, "#264021"],
  [196, 654, -48, 1.15, "#2A4724"],
  [214, 642, -12, 1.25, "#2A4724"],
  [230, 648, 32, 1.2, "#2A4724"],
  [216, 662, 10, 1.2, "#2A4724"],
  // Mid-green dense foliage layer
  [188, 662, -64, 1.05, "#3A5A2D"],
  [192, 648, -42, 1.1, "#3A5A2D"],
  [202, 636, -24, 1.1, "#3A5A2D"],
  [214, 630, 2, 1.15, "#3A5A2D"],
  [226, 634, 24, 1.1, "#3A5A2D"],
  [236, 644, 48, 1.1, "#3A5A2D"],
  [242, 658, 68, 1.05, "#3A5A2D"],
  [202, 656, -26, 1.1, "#416332"],
  [216, 650, -6, 1.15, "#416332"],
  [228, 654, 22, 1.1, "#416332"],
  [196, 666, -46, 1.0, "#3D5E2F"],
  [222, 664, 34, 1.0, "#3D5E2F"],
  [210, 666, -8, 1.05, "#3D5E2F"],
  // Sunlit upper-canopy small leaf clusters
  [196, 642, -32, 0.92, "#57763B"],
  [208, 634, -14, 0.96, "#5D7D3F"],
  [220, 636, 14, 0.94, "#57763B"],
  [232, 646, 36, 0.92, "#57763B"],
  [204, 650, -18, 0.9, "#5D7D3F"],
  [218, 648, 10, 0.92, "#5D7D3F"],
  [236, 658, 52, 0.88, "#537238"],
  [190, 658, -54, 0.88, "#537238"],
  // Trailing shoots over pot sides
  [184, 672, -135, 0.85, "#426331"],
  [178, 682, -148, 0.8, "#55743A"],
  [242, 672, 132, 0.85, "#426331"],
  [246, 682, 145, 0.78, "#55743A"],
];

// Dense rounded dome of 38 tiny pointed leaves for F1 right compact bush
const F1_RIGHT_BUSH_LEAVES: Array<[number, number, number, number, string]> = [
  // Back dark silhouette
  [492, 328, -82, 0.95, "#233C1D"],
  [488, 316, -64, 1.0, "#233C1D"],
  [496, 304, -46, 1.0, "#233C1D"],
  [506, 294, -28, 1.05, "#233C1D"],
  [518, 288, -10, 1.05, "#233C1D"],
  [530, 288, 12, 1.05, "#233C1D"],
  [542, 294, 32, 1.0, "#233C1D"],
  [552, 304, 52, 1.0, "#233C1D"],
  [558, 316, 70, 0.98, "#233C1D"],
  [556, 328, 88, 0.92, "#233C1D"],
  [502, 326, -54, 1.0, "#2C4F28"],
  [522, 318, -8, 1.05, "#2C4F28"],
  [542, 322, 42, 1.0, "#2C4F28"],
  [564, 306, 58, 0.85, "#2C4F28"],
  [484, 324, -76, 0.85, "#2C4F28"],
  // Mid-green dense dome
  [496, 324, -62, 0.9, "#3B622E"],
  [502, 312, -40, 0.94, "#3F6C31"],
  [512, 302, -20, 0.96, "#3F6C31"],
  [524, 298, 2, 0.98, "#3F6C31"],
  [536, 302, 22, 0.96, "#3F6C31"],
  [546, 312, 44, 0.94, "#3F6C31"],
  [550, 324, 66, 0.9, "#3B622E"],
  [510, 324, -32, 0.95, "#3F6C31"],
  [524, 322, -4, 0.98, "#3F6C31"],
  [538, 324, 28, 0.95, "#3F6C31"],
  [516, 334, -18, 0.92, "#355B2A"],
  [530, 334, 18, 0.92, "#355B2A"],
  [498, 336, -52, 0.86, "#355B2A"],
  [546, 334, 54, 0.86, "#355B2A"],
  // Sunlit bright small leaf tips
  [506, 306, -32, 0.8, "#57853C"],
  [518, 300, -12, 0.84, "#5D8B41"],
  [530, 300, 14, 0.84, "#57853C"],
  [542, 308, 36, 0.8, "#57853C"],
  [514, 316, -22, 0.82, "#5D8B41"],
  [528, 316, 16, 0.82, "#5D8B41"],
  [502, 322, -48, 0.78, "#527D38"],
  [544, 322, 46, 0.78, "#527D38"],
  [522, 328, 0, 0.8, "#57853C"],
];

interface DarkStrelitziaProps {
  tx: number;
  ty: number;
  delayOffset: number;
}

/**
 * Fuller dark/mid-green strelitzia + dense rounded bushy companion pot used on Floors 2 & 3 left.
 * Authored in Floor 2 coordinates and translated cleanly for Floor 3.
 */
function LowerLeftBalconyPlants({ tx, ty, delayOffset }: DarkStrelitziaProps) {
  return (
    <g transform={`translate(${tx} ${ty})`}>
      {/* Strelitzia foliage (swaying) */}
      <g
        className="svg-sway-a"
        style={{ animationDelay: `${delayOffset}s` }}
      >
        {/* Stems rising from terracotta pot */}
        <g fill="none" strokeLinecap="round">
          <path d="M 132 660 Q 124 624 102 588" stroke="#6E8044" strokeWidth="4.2" />
          <path d="M 136 660 Q 130 618 118 576" stroke="#536B37" strokeWidth="4.4" />
          <path d="M 140 660 Q 140 614 146 568" stroke="#456033" strokeWidth="4.6" />
          <path d="M 144 660 Q 152 622 168 588" stroke="#36532F" strokeWidth="4.2" />
          <path d="M 129 660 Q 112 636 96 622" stroke="#4D6635" strokeWidth="3.2" />
        </g>

        {/* Back far-left horizontal dark notched leaf */}
        <path
          d="M 118 594 C 98 574 72 566 56 568 L 54 575 L 48 568 C 36 569 27 574 23 579 C 34 584 56 588 80 590 C 96 592 108 598 118 604 Z"
          fill="#264C32"
        />

        {/* Upper-left sunlit olive leaf */}
        <g>
          <path
            d="M 116 584 C 98 568 72 548 39 524 C 50 521 63 523 74 527 L 72 536 L 80 530 C 96 537 110 552 120 572 Z"
            fill="#7D9043"
          />
          <path
            d="M 116 584 C 102 562 84 544 39 524 C 66 544 88 566 112 586 Z"
            fill="#6C8039"
          />
          <path
            d="M 115 582 Q 82 552 44 526"
            stroke="#94A652"
            strokeWidth="1.6"
            fill="none"
          />
        </g>

        {/* Tall upper-left-center deep forest leaf */}
        <g>
          <path
            d="M 134 586 C 114 574 96 546 84 496 C 95 496 108 504 117 514 L 111 522 L 122 518 C 134 532 142 554 142 580 Z"
            fill="#1F472E"
          />
          <path
            d="M 136 584 C 122 556 106 524 85 497 C 102 528 118 558 130 584 Z"
            fill="#2B5637"
          />
          <path
            d="M 134 582 Q 112 538 87 499"
            stroke="#3C6B46"
            strokeWidth="1.6"
            fill="none"
          />
        </g>

        {/* Tall upper-right-center mid-forest leaf */}
        <g>
          <path
            d="M 148 576 C 136 558 138 534 152 518 L 160 524 L 157 514 C 170 503 185 498 198 499 C 194 516 178 548 158 574 Z"
            fill="#3B5F3B"
          />
          <path
            d="M 150 574 C 164 550 182 522 197 500 C 176 522 158 548 148 574 Z"
            fill="#2A4E32"
          />
          <path
            d="M 149 573 Q 170 536 195 502"
            stroke="#537848"
            strokeWidth="1.6"
            fill="none"
          />
        </g>

        {/* Wide right-arching deep green leaf */}
        <g>
          <path
            d="M 158 602 C 154 584 162 566 178 558 L 182 567 L 186 555 C 204 547 228 545 247 549 C 232 562 204 578 166 604 Z"
            fill="#244A30"
          />
          <path
            d="M 162 601 C 192 582 222 564 246 550 C 216 562 184 578 159 598 Z"
            fill="#325838"
          />
          <path
            d="M 160 600 Q 198 574 242 551"
            stroke="#466D45"
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* Lower-left small rounded dark leaf behind railing */}
        <path
          d="M 122 634 C 108 614 94 612 88 622 C 88 634 104 640 120 638 Z"
          fill="#254A30"
        />

        {/* Lower-right small dark leaf behind railing */}
        <path
          d="M 150 634 C 162 616 178 614 186 624 C 182 636 164 640 150 638 Z"
          fill="#2D5233"
        />
      </g>

      {/* Terracotta pot for strelitzia */}
      <ClayPot
        x={110}
        y={657}
        w={58}
        h={47}
        lightFill="#D28C6D"
        darkFill="#BA6D4E"
        rimFill="#9F553B"
      />

      {/* Companion bushy plant pot — dense cluster of small pointed leaves */}
      <g
        className="svg-sway-b"
        style={{ animationDelay: `${delayOffset - 1.9}s` }}
      >
        {/* Soft core shadow to tie small leaves into a lush dome */}
        <ellipse cx="213" cy="650" rx="28" ry="20" fill="#2A4624" />
        {LOWER_BUSH_LEAVES.map(([x, y, r, s, fill], i) => (
          <BushLeaf key={i} x={x} y={y} r={r} s={s} fill={fill} />
        ))}
      </g>

      {/* Brown clay pot for companion bush */}
      <ClayPot
        x={189}
        y={664}
        w={47}
        h={40}
        lightFill="#9A714C"
        darkFill="#7D5B3C"
        rimFill="#6E4E33"
      />
    </g>
  );
}

interface RightFicusProps {
  ty: number;
  delayOffset: number;
}

/**
 * Broad-leaf tropical plant (philodendron / ficus) in terracotta pot for Floors 2 & 3 right.
 * Lush, wide overlapping teardrop/oval leaves with full mid-canopy coverage.
 */
function RightBroadLeafPlant({ ty, delayOffset }: RightFicusProps) {
  return (
    <g transform={`translate(0 ${ty})`}>
      <g
        className="svg-sway-b"
        style={{ animationDelay: `${delayOffset}s` }}
      >
        {/* Short dark stem visible right above pot */}
        <path
          d="M 541 670 L 542 616"
          stroke="#2A452B"
          strokeWidth="6.5"
          strokeLinecap="round"
        />

        {/* Back lower-left broad drooping teardrop leaf */}
        <path
          d="M 540 622 C 520 604 494 612 480 644 C 504 644 528 636 544 628 Z"
          fill="#375737"
        />

        {/* Mid-left broad dark overlapping leaf */}
        <path
          d="M 538 616 C 516 588 492 580 480 596 C 492 614 516 626 542 624 Z"
          fill="#2C4B31"
        />

        {/* Upper-left outer wide oval/teardrop leaf */}
        <g>
          <path
            d="M 536 600 C 502 586 482 566 479 534 C 504 540 528 560 544 590 Z"
            fill="#325236"
          />
          <path
            d="M 536 596 Q 508 568 483 538"
            stroke="#4B6E44"
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* Upper-left inner lush broad sunlit leaf */}
        <g>
          <path
            d="M 542 592 C 512 574 496 546 500 518 C 526 524 548 548 552 584 Z"
            fill="#4B6F40"
          />
          <path
            d="M 542 590 C 526 562 512 538 502 520 C 516 548 526 572 536 590 Z"
            fill="#3B5D39"
          />
          <path
            d="M 542 588 Q 522 554 503 522"
            stroke="#64874E"
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* Tallest top-right broad sunlit teardrop leaf */}
        <g>
          <path
            d="M 546 592 C 534 560 548 524 580 510 C 590 538 578 570 554 596 Z"
            fill="#597843"
          />
          <path
            d="M 550 594 C 564 564 576 538 580 512 C 562 536 550 562 546 592 Z"
            fill="#44653B"
          />
          <path
            d="M 548 590 Q 562 548 578 514"
            stroke="#719155"
            strokeWidth="1.6"
            fill="none"
          />
        </g>

        {/* Lower-right lush shaded broad leaf */}
        <path
          d="M 546 618 C 568 596 598 594 618 610 C 600 632 570 638 544 628 Z"
          fill="#2F4E33"
        />

        {/* Mid-right wide sweeping broad leaf */}
        <g>
          <path
            d="M 546 604 C 566 568 598 554 626 562 C 618 590 588 610 550 614 Z"
            fill="#4C6F40"
          />
          <path
            d="M 550 610 C 580 598 608 582 624 564 C 594 574 568 588 548 604 Z"
            fill="#375736"
          />
          <path
            d="M 548 608 Q 584 584 622 565"
            stroke="#658850"
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* Mid-canopy lush overlapping center leaves (covers stem junction cleanly) */}
        <g>
          <path
            d="M 538 636 C 516 624 512 602 528 590 C 546 596 554 618 546 636 Z"
            fill="#395A38"
          />
          <path
            d="M 546 634 C 540 610 552 590 572 586 C 580 606 568 628 548 638 Z"
            fill="#45663C"
          />
          <path
            d="M 544 614 C 524 592 526 566 544 552 C 564 566 566 592 548 614 Z"
            fill="#567742"
          />
          <path
            d="M 545 612 Q 545 582 544 556"
            stroke="#719256"
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      </g>

      {/* Terracotta pot */}
      <ClayPot
        x={512}
        y={668}
        w={55}
        h={36}
        lightFill="#BC6E4F"
        darkFill="#9F5A40"
        rimFill="#8A4B34"
      />
    </g>
  );
}

/**
 * All balcony plants and pots that sit BEHIND the railings and front concrete slabs.
 */
export function BalconyFoliage() {
  return (
    <g id="balcony-foliage">
      {/* ==================================================================
          FLOOR 1 LEFT: Warm sunlit Strelitzia + smaller bushy companion pot
         ================================================================== */}
      <g id="floor-1-left-plants">
        <g className="svg-sway-a" style={{ animationDelay: "-0.4s" }}>
          {/* Stems */}
          <g fill="none" strokeLinecap="round">
            <path d="M 127 325 Q 118 286 106 252" stroke="#7E8D3F" strokeWidth="4" />
            <path d="M 132 325 Q 130 282 132 240" stroke="#6E8039" strokeWidth="4.4" />
            <path d="M 137 325 Q 142 284 149 246" stroke="#5A7034" strokeWidth="4.2" />
            <path d="M 142 325 Q 150 296 164 276" stroke="#4D6430" strokeWidth="3.4" />
          </g>

          {/* Far-left arching leaf */}
          <g>
            <path
              d="M 118 256 C 102 232 82 218 68 216 L 65 224 L 59 216 C 48 218 39 224 35 231 C 50 232 72 236 92 246 C 102 251 110 256 116 262 Z"
              fill="#6C813A"
            />
            <path
              d="M 116 258 C 92 240 66 228 37 230 C 64 224 90 234 114 256 Z"
              fill="#556C33"
            />
          </g>

          {/* Upper-left broad sunlit olive leaf */}
          <g>
            <path
              d="M 126 254 C 106 228 84 196 58 162 C 74 160 88 166 98 174 L 94 182 L 104 178 C 118 192 128 216 132 246 Z"
              fill="#8F9A39"
            />
            <path
              d="M 128 252 C 114 224 96 194 60 163 C 86 188 106 218 122 252 Z"
              fill="#7D8C39"
            />
            <path
              d="M 126 250 Q 98 206 63 166"
              stroke="#A5AF4E"
              strokeWidth="1.6"
              fill="none"
            />
          </g>

          {/* Tallest center-right sunlit leaf */}
          <g>
            <path
              d="M 134 248 C 132 216 140 182 156 162 L 163 168 L 162 158 C 166 153 171 149 175 148 C 174 168 162 204 142 244 Z"
              fill="#87953E"
            />
            <path
              d="M 138 246 C 148 214 162 180 174 149 C 158 176 144 210 135 246 Z"
              fill="#6C8239"
            />
            <path
              d="M 136 244 Q 154 196 172 152"
              stroke="#A0AA4C"
              strokeWidth="1.6"
              fill="none"
            />
          </g>

          {/* Right-arching mid-green leaf */}
          <g>
            <path
              d="M 144 258 C 146 234 156 212 172 202 L 176 209 L 179 199 C 188 194 198 194 205 198 C 194 212 174 234 150 262 Z"
              fill="#637C3A"
            />
            <path
              d="M 146 260 C 166 236 186 216 204 199 C 182 214 162 234 145 258 Z"
              fill="#4D6631"
            />
            <path
              d="M 146 258 Q 172 226 200 201"
              stroke="#7A9045"
              strokeWidth="1.4"
              fill="none"
            />
          </g>

          {/* Lower-right mid leaf */}
          <path
            d="M 148 278 C 156 256 170 238 186 232 C 182 250 168 268 150 282 Z"
            fill="#566E33"
          />

          {/* Lower-left small leaf behind railing */}
          <path
            d="M 122 290 C 102 272 84 260 69 258 C 78 272 98 286 120 296 Z"
            fill="#5A7235"
          />

          {/* Lower-right small leaf behind railing */}
          <path
            d="M 146 296 C 162 280 176 272 189 272 C 182 286 164 296 146 302 Z"
            fill="#465E2C"
          />
        </g>

        {/* Terracotta pot */}
        <ClayPot
          x={104}
          y={322}
          w={61}
          h={50}
          lightFill="#D68261"
          darkFill="#BA6645"
          rimFill="#A4573A"
        />

        {/* Smaller bushy fern/plant pot beside it */}
        <g className="svg-sway-b" style={{ animationDelay: "-2.1s" }}>
          <g fill="#3E5629">
            <path d="M 205 338 Q 186 324 174 318 Q 190 318 208 330 Z" />
            <path d="M 208 334 Q 188 312 182 298 Q 198 308 212 328 Z" />
            <path d="M 212 332 Q 204 302 212 285 Q 220 304 218 332 Z" />
            <path d="M 216 334 Q 228 306 242 298 Q 236 316 220 336 Z" />
            <path d="M 218 338 Q 236 322 248 318 Q 238 330 220 340 Z" />
          </g>
          <g fill="#5B7337">
            <path d="M 206 338 Q 184 328 176 328 Q 192 322 208 332 Z" />
            <path d="M 210 334 Q 196 310 198 294 Q 208 308 214 332 Z" />
            <path d="M 214 334 Q 222 304 232 292 Q 230 312 218 334 Z" />
            <path d="M 218 336 Q 236 318 247 308 Q 238 324 220 338 Z" />
            <path d="M 202 338 Q 186 336 180 342 Q 194 342 206 340 Z" />
          </g>
          <g fill="#7A8F44">
            <path d="M 210 334 Q 204 314 209 301 Q 216 314 214 334 Z" />
            <path d="M 214 334 Q 222 316 232 308 Q 226 322 217 336 Z" />
            <path d="M 208 336 Q 196 320 190 314 Q 200 322 210 336 Z" />
          </g>
        </g>

        <ClayPot
          x={187}
          y={336}
          w={47}
          h={36}
          lightFill="#97724C"
          darkFill="#7D5D3D"
          rimFill="#694E32"
        />
      </g>

      {/* ==================================================================
          FLOOR 2 LEFT: Fuller dark/mid-green Strelitzia + bushy companion
         ================================================================== */}
      <g id="floor-2-left-plants">
        <LowerLeftBalconyPlants tx={0} ty={0} delayOffset={-1.2} />
      </g>

      {/* ==================================================================
          FLOOR 3 LEFT: Fuller dark/mid-green Strelitzia + bushy companion
         ================================================================== */}
      <g id="floor-3-left-plants">
        <LowerLeftBalconyPlants tx={-9} ty={348} delayOffset={-2.8} />
      </g>

      {/* ==================================================================
          FLOOR 1 RIGHT: Compact dense dome bush + fuller feathery fan palms
         ================================================================== */}
      <g id="floor-1-right-plants">
        {/* Compact dense dome of 38 tiny pointed leaves */}
        <g className="svg-sway-b" style={{ animationDelay: "-0.9s" }}>
          <ellipse cx="524" cy="318" rx="25" ry="18" fill="#253E1E" />
          {F1_RIGHT_BUSH_LEAVES.map(([x, y, r, s, fill], i) => (
            <BushLeaf key={i} x={x} y={y} r={r} s={s} fill={fill} />
          ))}
        </g>

        <ClayPot
          x={504}
          y={336}
          w={40}
          h={36}
          lightFill="#C17354"
          darkFill="#A55B40"
          rimFill="#8F4C34"
        />

        {/* Upper-right fuller tapered fan-palm fronds */}
        <g className="svg-sway-a" style={{ animationDelay: "-3.1s" }}>
          {/* Palmate fan-palm frond centered at (658, 178) with fuller tapered fingers */}
          <g fill="#4F6E3C" opacity="0.92">
            <circle cx="658" cy="179" r="14" />
            <path d="M 656 175 C 632 172 612 172 597 175 C 612 181 632 184 656 183 Z" />
            <path d="M 656 175 C 634 164 616 158 603 157 C 615 166 632 174 655 182 Z" />
            <path d="M 656 175 C 640 156 630 146 623 142 C 629 154 640 166 654 180 Z" />
            <path d="M 656 175 C 650 152 648 140 648 135 C 655 144 660 158 661 178 Z" />
            <path d="M 657 175 C 664 152 670 142 675 138 C 674 150 668 164 662 179 Z" />
            <path d="M 658 176 C 674 158 686 150 695 148 C 689 160 676 170 662 180 Z" />
            <path d="M 659 177 C 682 168 696 165 707 166 C 696 175 680 180 662 182 Z" />
            <path d="M 659 178 C 682 182 696 186 706 192 C 692 193 676 189 661 183 Z" />
            <path d="M 658 179 C 676 194 688 206 695 215 C 682 210 669 199 659 183 Z" />
            <path d="M 657 180 C 668 202 673 216 675 226 C 665 216 659 202 656 183 Z" />
            <path d="M 656 180 C 652 204 650 218 648 228 C 644 214 647 198 654 182 Z" />
            <path d="M 655 180 C 638 198 628 210 623 219 C 626 204 636 191 653 181 Z" />
            <path d="M 655 179 C 630 190 616 198 608 204 C 616 192 632 184 653 180 Z" />
            <path d="M 655 178 C 628 182 612 185 601 189 C 614 182 630 179 654 179 Z" />
          </g>

          {/* Upper-right fuller pinnate palm frond entering from right edge */}
          <g fill="#3E5D32">
            <path d="M 720 124 C 708 112 701 106 696 102 C 706 105 714 110 720 117 Z" />
            <path d="M 720 136 C 702 122 692 115 684 111 C 698 114 710 120 720 128 Z" />
            <path d="M 720 148 C 698 135 686 129 678 126 C 694 128 708 134 720 140 Z" />
            <path d="M 720 160 C 698 150 684 146 676 144 C 692 144 708 148 720 152 Z" />
            <path d="M 720 172 C 698 164 686 162 678 161 C 694 159 708 161 720 164 Z" />
            <path d="M 720 184 C 700 180 688 180 682 181 C 696 176 708 176 720 177 Z" />
            <path d="M 720 196 C 704 196 694 199 688 202 C 700 193 710 190 720 189 Z" />
          </g>

          {/* Lower-right fuller dark palm frond leaflets near edge */}
          <g fill="#2F4B2A">
            <path d="M 720 230 C 704 216 694 208 686 203 C 700 208 712 215 720 222 Z" />
            <path d="M 720 246 C 702 234 690 228 682 225 C 698 227 710 232 720 238 Z" />
            <path d="M 720 262 C 702 254 690 250 684 249 C 698 248 710 250 720 254 Z" />
            <path d="M 720 278 C 704 274 694 273 688 274 C 700 269 710 269 720 270 Z" />
            <path d="M 720 294 C 706 294 698 298 694 302 C 704 291 712 287 720 286 Z" />
          </g>
        </g>
      </g>

      {/* ==================================================================
          FLOOR 2 RIGHT: Broad-leaf tropical plant in terracotta pot
         ================================================================== */}
      <g id="floor-2-right-plant">
        <RightBroadLeafPlant ty={0} delayOffset={-1.6} />
      </g>

      {/* ==================================================================
          FLOOR 3 RIGHT: Broad-leaf tropical plant in terracotta pot
         ================================================================== */}
      <g id="floor-3-right-plant">
        <RightBroadLeafPlant ty={348} delayOffset={-3.4} />
      </g>
    </g>
  );
}
