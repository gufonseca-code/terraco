interface HeartLeafProps {
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  fill: string;
  vein?: string;
}

/**
 * Compact, crisp heart-shaped pothos leaf centered at its stem attachment point (0, 0).
 */
function HeartLeaf({
  x,
  y,
  scale = 1,
  rotate = 0,
  fill,
  vein,
}: HeartLeafProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path
        d="M 0 0 C -5 -3.5 -10 1.2 -8.5 7.5 C -7 12.5 -2 17 0 20 C 2 17 7 12.5 8.5 7.5 C 10 1.2 5 -3.5 0 0 Z"
        fill={fill}
      />
      {vein && (
        <path
          d="M 0 1.5 Q 0.6 10 0 18"
          stroke={vein}
          strokeWidth="1"
          fill="none"
          opacity={0.72}
        />
      )}
    </g>
  );
}

interface HangingVineProps {
  ty: number;
  delayOffset: number;
}

/**
 * Airy, organic cascading pothos/ivy cluster draping over the right balcony slab.
 * Authored in Floor 1 coordinates (y=300..548) and reused for Floor 2 (ty=334).
 */
function CascadingPothosVine({ ty, delayOffset }: HangingVineProps) {
  return (
    <g transform={`translate(0 ${ty})`}>
      {/* Peeking warm clay hanging planter on right edge */}
      <path
        d="M 698 334 L 720 332 L 720 374 L 702 374 Q 697 354 698 334 Z"
        fill="#9B7544"
      />
      <path
        d="M 702 356 L 720 356 L 720 374 L 702 374 Z"
        fill="#826035"
        opacity={0.65}
      />

      {/* Upper lush crown of smaller overlapping heart leaves */}
      <g
        className="svg-sway-vine"
        style={{ animationDelay: `${delayOffset}s` }}
      >
        {/* Deep shadow backing leaves */}
        <HeartLeaf x={644} y={306} scale={1.1} rotate={24} fill="#264220" />
        <HeartLeaf x={670} y={304} scale={1.05} rotate={-14} fill="#243E1F" />
        <HeartLeaf x={696} y={308} scale={1.12} rotate={-32} fill="#284422" />
        <HeartLeaf x={712} y={316} scale={1.05} rotate={-46} fill="#243E1F" />
        <HeartLeaf x={626} y={342} scale={1.0} rotate={44} fill="#2C4A25" />
        <HeartLeaf x={694} y={346} scale={1.15} rotate={-22} fill="#243F1F" />
        <HeartLeaf x={662} y={366} scale={1.05} rotate={18} fill="#284522" />

        {/* Mid-green layered crown leaves */}
        <HeartLeaf x={652} y={314} scale={1.05} rotate={14} fill="#5C7735" vein="#769044" />
        <HeartLeaf x={682} y={312} scale={1.0} rotate={-26} fill="#526D30" vein="#6E883F" />
        <HeartLeaf x={634} y={328} scale={1.08} rotate={36} fill="#6E863B" vein="#879E4A" />
        <HeartLeaf x={666} y={322} scale={1.15} rotate={4} fill="#768D3E" vein="#90A54D" />
        <HeartLeaf x={692} y={328} scale={1.0} rotate={-40} fill="#668038" />
        <HeartLeaf x={642} y={352} scale={1.05} rotate={22} fill="#6C843A" />
        <HeartLeaf x={678} y={348} scale={1.1} rotate={-10} fill="#748C3E" />
        <HeartLeaf x={622} y={358} scale={0.92} rotate={48} fill="#678038" />

        {/* Bright sunlit olive-chartreuse top leaves */}
        <HeartLeaf x={658} y={324} scale={1.2} rotate={14} fill="#879B42" vein="#A0B256" />
        <HeartLeaf x={674} y={332} scale={1.14} rotate={-16} fill="#8FA247" vein="#A7B85B" />
        <HeartLeaf x={644} y={336} scale={1.05} rotate={32} fill="#839741" vein="#9CAF53" />
        <HeartLeaf x={668} y={356} scale={1.04} rotate={8} fill="#849841" />
        <HeartLeaf x={704} y={324} scale={0.92} rotate={-50} fill="#829640" />
        <HeartLeaf x={652} y={348} scale={0.96} rotate={-8} fill="#8EA146" />

        {/* Contrasting dark foreground accent leaves along slab edge */}
        <HeartLeaf x={656} y={366} scale={1.0} rotate={24} fill="#2B4924" vein="#436436" />
        <HeartLeaf x={694} y={356} scale={1.12} rotate={-26} fill="#2A4823" vein="#416235" />
        <HeartLeaf x={676} y={374} scale={0.92} rotate={14} fill="#3E5D2E" />
        <HeartLeaf x={644} y={374} scale={0.86} rotate={-16} fill="#365529" />
      </g>

      {/* Airy trailing vine stems & compact cascading leaf clusters */}
      <g
        className="svg-sway-vine"
        style={{ animationDelay: `${delayOffset - 0.85}s` }}
      >
        {/* Clearly visible thin dark-green trailing stems */}
        <g fill="none" stroke="#3F562A" strokeLinecap="round">
          {/* Left short cascade */}
          <path d="M 624 366 Q 614 378 614 394" strokeWidth="1.6" />
          <path d="M 638 374 Q 642 404 654 424 Q 656 440 636 454" strokeWidth="1.6" />
          {/* Center-right main deep cascade */}
          <path d="M 678 380 Q 686 410 676 440 Q 664 468 684 494 Q 694 516 692 544" strokeWidth="1.8" />
          {/* Secondary right branch */}
          <path d="M 696 378 Q 708 406 704 438 Q 696 458 684 470" strokeWidth="1.5" />
          {/* Cross tendril */}
          <path d="M 652 424 Q 668 420 680 430" strokeWidth="1.3" />
        </g>

        {/* Left cascade compact leaves */}
        <HeartLeaf x={618} y={376} scale={0.92} rotate={34} fill="#5C7635" vein="#789146" />
        <HeartLeaf x={634} y={386} scale={0.82} rotate={14} fill="#7A9040" vein="#93A852" />
        <HeartLeaf x={641} y={404} scale={0.76} rotate={-16} fill="#44622F" />
        <HeartLeaf x={637} y={414} scale={0.82} rotate={24} fill="#365429" />
        <HeartLeaf x={648} y={436} scale={0.86} rotate={42} fill="#355529" vein="#4F703B" />
        <HeartLeaf x={638} y={448} scale={0.78} rotate={36} fill="#2A4622" />

        {/* Center-right main cascade compact leaves */}
        <HeartLeaf x={688} y={392} scale={0.86} rotate={-20} fill="#355429" vein="#4E6E3A" />
        <HeartLeaf x={680} y={406} scale={0.8} rotate={18} fill="#2A4622" />
        <HeartLeaf x={690} y={426} scale={0.92} rotate={36} fill="#466631" vein="#628242" />
        <HeartLeaf x={668} y={452} scale={0.84} rotate={28} fill="#38582B" vein="#52733E" />
        <HeartLeaf x={684} y={456} scale={0.9} rotate={-10} fill="#3B5C2D" vein="#567841" />
        <HeartLeaf x={670} y={476} scale={0.84} rotate={-12} fill="#2C4924" />

        {/* Far-right branch compact leaves */}
        <HeartLeaf x={704} y={404} scale={0.84} rotate={-28} fill="#4D6C35" />
        <HeartLeaf x={706} y={434} scale={0.78} rotate={24} fill="#3D5C2E" vein="#597841" />
        <HeartLeaf x={696} y={450} scale={0.7} rotate={-34} fill="#506E36" />

        {/* Lower translucent / sunlit trailing pothos tips */}
        <HeartLeaf x={686} y={478} scale={0.78} rotate={-20} fill="#7B9047" vein="#95A95D" />
        <HeartLeaf x={674} y={504} scale={0.86} rotate={12} fill="#314E28" />
        <HeartLeaf x={690} y={502} scale={0.78} rotate={-16} fill="#889C50" vein="#A3B667" />
        <HeartLeaf x={678} y={528} scale={0.88} rotate={-8} fill="#2C4825" />
        <HeartLeaf x={694} y={528} scale={0.78} rotate={-28} fill="#879B4F" vein="#A3B666" />
      </g>
    </g>
  );
}

/**
 * All foreground foliage that renders IN FRONT OF railings and front concrete slabs:
 * - Upper-right & mid-right cascading pothos/ivy vines
 * - Bottom-right hero banana/strelitzia & fenestrated monstera cluster
 */
export function ForegroundFoliage() {
  return (
    <g id="foreground-foliage">
      {/* ==================================================================
          UPPER-RIGHT CASCADING POTHOS VINE (over Floor 1 slab)
         ================================================================== */}
      <g id="upper-right-vine">
        <CascadingPothosVine ty={0} delayOffset={-0.6} />
      </g>

      {/* ==================================================================
          MID-RIGHT CASCADING POTHOS VINE (over Floor 2 slab)
         ================================================================== */}
      <g id="mid-right-vine">
        <CascadingPothosVine ty={334} delayOffset={-2.9} />
      </g>

      {/* ==================================================================
          BOTTOM-RIGHT HERO TROPICAL CLUSTER (Banana/Strelitzia + Monstera)
         ================================================================== */}
      <g id="foreground-hero-cluster">
        {/* Back tall muted sage-green upright leaf */}
        <g className="svg-sway-fg" style={{ animationDelay: "-3.6s" }}>
          <path
            d="M 610 1170 C 594 1090 592 985 606 914 C 626 955 636 1055 628 1170 Z"
            fill="#4A6B4A"
          />
          <path
            d="M 612 1168 Q 612 1035 607 918"
            stroke="#5E815A"
            strokeWidth="2.2"
            fill="none"
          />
        </g>

        {/* Back tall deep-forest upright banana leaf */}
        <g className="svg-sway-fg" style={{ animationDelay: "-2.2s" }}>
          <path
            d="M 624 1196 C 596 1118 576 1044 571 972 C 598 994 628 1038 648 1098 C 656 1134 654 1174 644 1204 Z"
            fill="#1B3E2B"
          />
          <path
            d="M 626 1192 C 608 1114 592 1040 573 976 C 596 1032 612 1110 620 1192 Z"
            fill="#274E35"
          />
          <path
            d="M 626 1194 Q 604 1078 574 978"
            stroke="#366242"
            strokeWidth="2.4"
            fill="none"
          />
        </g>

        {/* Far-right huge sunlit olive/forest banana leaf entering from right edge */}
        <g className="svg-sway-fg" style={{ animationDelay: "-1.1s" }}>
          <path
            d="M 672 1142 C 664 1084 670 1018 686 968 L 696 974 L 692 958 C 702 930 712 910 720 896 L 720 1068 C 704 1098 690 1126 678 1150 Z"
            fill="#8F9F3E"
          />
          <path
            d="M 678 1148 C 694 1086 708 1032 720 986 L 720 1132 C 706 1142 692 1152 678 1158 Z"
            fill="#375F35"
          />
          <path
            d="M 675 1146 Q 698 1054 720 974"
            stroke="#A4B44F"
            strokeWidth="2.8"
            fill="none"
          />
        </g>

        {/* Far-left lower mid-green notched banana leaf */}
        <g className="svg-sway-fg" style={{ animationDelay: "-4.1s" }}>
          <path
            d="M 544 1196 C 484 1194 426 1178 398 1154 C 384 1144 370 1138 358 1134 C 378 1130 404 1134 430 1144 L 424 1156 L 440 1148 C 476 1160 512 1174 548 1184 Z"
            fill="#3E613C"
          />
          <path
            d="M 544 1192 Q 452 1164 364 1135"
            stroke="#567C4D"
            strokeWidth="2"
            fill="none"
          />
        </g>

        {/* Mid-left dark forest notched banana leaf */}
        <g className="svg-sway-fg" style={{ animationDelay: "-1.7s" }}>
          <path
            d="M 558 1184 C 514 1164 468 1142 440 1118 C 420 1102 406 1090 400 1083 C 420 1082 442 1088 460 1096 L 456 1114 L 468 1100 C 486 1108 500 1116 510 1124 L 506 1138 L 518 1128 C 538 1142 554 1158 566 1178 Z"
            fill="#1B412B"
          />
          <path
            d="M 556 1180 Q 478 1134 405 1086"
            stroke="#315C3D"
            strokeWidth="2.2"
            fill="none"
          />
        </g>

        {/* HERO DIAGONAL SUNLIT BANANA LEAF (sweeping up-left to 423, 1002) */}
        <g className="svg-sway-fg" style={{ animationDelay: "-0.3s" }}>
          <path
            d="M 624 1226 C 584 1196 524 1154 476 1098 C 446 1062 426 1028 422 1004 C 424 1000 430 999 436 1001 C 468 1036 538 1114 624 1218 Z"
            fill="#8D9E43"
          />
          <path
            d="M 612 1216 C 570 1186 516 1144 474 1094 C 450 1066 434 1038 426 1012 C 452 1044 516 1116 612 1216 Z"
            fill="#7E913D"
            opacity={0.45}
          />
          <path
            d="M 626 1218 C 594 1176 544 1116 488 1054 C 464 1028 442 1008 426 1001 C 446 998 468 1006 486 1018 L 478 1030 L 494 1022 C 516 1036 536 1052 552 1068 L 542 1086 L 560 1076 C 588 1104 612 1144 630 1208 Z"
            fill="#436839"
          />
          <path
            d="M 624 1224 C 582 1172 522 1102 428 1004 C 430 1003 433 1004 435 1006 C 526 1100 588 1168 629 1220 Z"
            fill="#A5B457"
          />
        </g>

        {/* Right-side upright broad sunlit olive leaf + chartreuse inner leaf */}
        <g className="svg-sway-fg" style={{ animationDelay: "-2.7s" }}>
          <path
            d="M 634 1280 Q 652 1220 666 1168"
            stroke="#597036"
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M 678 1280 Q 686 1218 692 1168"
            stroke="#365531"
            strokeWidth="6.5"
            fill="none"
          />
          <path
            d="M 654 1172 C 642 1142 646 1098 666 1072 C 688 1090 698 1134 686 1176 Z"
            fill="#859743"
          />
          <path
            d="M 666 1074 C 676 1102 676 1140 668 1174"
            stroke="#9CAE53"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M 684 1178 C 678 1148 686 1118 702 1102 C 712 1126 708 1156 694 1180 Z"
            fill="#92A448"
          />
        </g>

        {/* Deep shadow monstera lobe tucked between the two main monsteras */}
        <g className="svg-sway-fg" style={{ animationDelay: "-1.9s" }}>
          <path
            d="M 588 1280 C 594 1252 612 1236 632 1238 C 646 1240 656 1252 662 1280 Z"
            fill="#16301E"
          />
        </g>

        {/* ================================================================
            MAIN SUNLIT FENESTRATED MONSTERA DELICIOSA LEAF
            Rounder heart silhouette centered ~x=548, y=1228 with 6 deep
            curved finger-like lobes/slits per side + oval inner perforations
           ================================================================ */}
        <g className="svg-sway-fg" style={{ animationDelay: "-0.7s" }}>
          <path
            fillRule="evenodd"
            fill="#7B9345"
            d="
              M 552 1154
              C 564 1154 576 1158 586 1164
              C 576 1174 568 1184 564 1190
              C 574 1182 588 1174 600 1172
              C 608 1178 616 1186 621 1194
              C 606 1196 590 1200 580 1206
              C 594 1204 612 1204 626 1206
              C 631 1215 634 1225 635 1234
              C 618 1228 600 1226 588 1228
              C 604 1232 622 1238 634 1246
              C 634 1256 632 1266 628 1276
              C 612 1264 596 1256 584 1254
              C 598 1262 612 1271 620 1280
              L 590 1280
              C 584 1270 576 1262 570 1258
              C 574 1266 576 1274 576 1280
              L 548 1280
              C 548 1270 550 1262 554 1256
              C 546 1264 538 1272 532 1280
              L 504 1280
              C 514 1266 528 1256 538 1250
              C 522 1254 504 1264 490 1276
              C 484 1268 479 1258 476 1248
              C 492 1240 512 1234 526 1232
              C 508 1230 488 1232 472 1236
              C 470 1226 471 1216 474 1206
              C 492 1204 512 1206 526 1210
              C 510 1200 490 1196 478 1196
              C 482 1186 488 1178 496 1172
              C 510 1178 524 1186 534 1194
              C 522 1182 510 1170 504 1164
              C 516 1157 528 1154 538 1154
              C 541 1166 544 1178 546 1186
              C 548 1176 550 1164 552 1154 Z
              M 530 1216 A 5.5 3 -18 1 0 541 1216 A 5.5 3 -18 1 0 530 1216 Z
              M 540 1200 A 5 2.8 -24 1 0 550 1200 A 5 2.8 -24 1 0 540 1200 Z
              M 564 1208 A 5.5 3 16 1 0 575 1208 A 5.5 3 16 1 0 564 1208 Z
              M 566 1232 A 6 3.2 26 1 0 578 1232 A 6 3.2 26 1 0 566 1232 Z
              M 522 1240 A 5.5 3 -30 1 0 533 1240 A 5.5 3 -30 1 0 522 1240 Z
            "
          />
          {/* Subtle darker olive-green depth shading on left half */}
          <path
            fillRule="evenodd"
            fill="#5C7736"
            opacity={0.38}
            d="
              M 552 1154
              C 550 1164 548 1176 546 1186
              C 544 1178 541 1166 538 1154
              C 528 1154 516 1157 504 1164
              C 510 1170 522 1182 534 1194
              C 524 1186 510 1178 496 1172
              C 488 1178 482 1186 478 1196
              C 490 1196 510 1200 526 1210
              C 512 1206 492 1204 474 1206
              C 471 1216 470 1226 472 1236
              C 488 1232 508 1230 526 1232
              C 512 1234 492 1240 476 1248
              C 479 1258 484 1268 490 1276
              C 504 1264 522 1254 538 1250
              L 552 1230 L 552 1154 Z
            "
          />
          {/* Delicate warm-olive central midrib & curved lateral veins */}
          <g fill="none" stroke="#9DB062" strokeLinecap="round" opacity={0.82}>
            <path d="M 550 1280 Q 551 1232 552 1162" strokeWidth="2.5" />
            <path d="M 551 1202 Q 520 1192 490 1186" strokeWidth="1.3" />
            <path d="M 551 1220 Q 516 1216 480 1218" strokeWidth="1.4" />
            <path d="M 550 1240 Q 514 1244 484 1258" strokeWidth="1.4" />
            <path d="M 552 1200 Q 584 1188 612 1184" strokeWidth="1.3" />
            <path d="M 552 1218 Q 588 1214 624 1218" strokeWidth="1.4" />
            <path d="M 551 1240 Q 590 1244 626 1258" strokeWidth="1.4" />
          </g>
        </g>

        {/* ================================================================
            RIGHT DARK-FOREST FENESTRATED MONSTERA LEAF (bottom-right corner)
            Crisp, deep curved finger-like slits + oval inner perforations
           ================================================================ */}
        <g className="svg-sway-fg" style={{ animationDelay: "-2.5s" }}>
          <path
            fillRule="evenodd"
            fill="#1D4029"
            d="
              M 694 1170
              C 706 1170 715 1174 720 1180
              L 720 1280
              L 652 1280
              C 648 1270 646 1260 646 1250
              C 662 1246 680 1246 692 1250
              C 676 1238 656 1234 642 1234
              C 642 1224 644 1214 648 1206
              C 664 1208 682 1214 694 1222
              C 678 1206 660 1198 648 1194
              C 654 1184 662 1176 672 1172
              C 680 1180 688 1190 694 1198
              C 692 1188 692 1178 694 1170 Z
              M 696 1228 A 5.5 3 16 1 0 707 1228 A 5.5 3 16 1 0 696 1228 Z
              M 684 1256 A 5.5 3 -18 1 0 695 1256 A 5.5 3 -18 1 0 684 1256 Z
            "
          />
          {/* Subtle forest-green veins */}
          <g fill="none" stroke="#366041" strokeLinecap="round" opacity={0.78}>
            <path d="M 700 1280 Q 699 1234 702 1180" strokeWidth="2.2" />
            <path d="M 700 1208 Q 678 1198 658 1192" strokeWidth="1.3" />
            <path d="M 700 1230 Q 674 1224 650 1224" strokeWidth="1.4" />
            <path d="M 699 1254 Q 674 1256 652 1264" strokeWidth="1.4" />
          </g>
        </g>
      </g>
    </g>
  );
}
