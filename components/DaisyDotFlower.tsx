'use client';

import { useId } from 'react';

// A square viewBox centered on (and sized to) the smallest circle that
// fully encloses the flower path's anchor/control points — the largest the
// flower can render without any petal getting clipped by a circular mask
// exactly this size. Off-center on purpose: nudges the visual weight of the
// flower toward the bottom of that circle.
const VIEW_BOX = '-105 -245 1686 1686';

const VECTOR_D =
  'M754.648 9.34294C818.384 -10.1772 901.069 -0.50454 947.164 51.6184C1001.84 113.441 1003.62 173.282 1000.58 250.866C1053.19 181.382 1074.96 151.759 1156.78 112.27C1333.32 27.0691 1476.09 192.708 1400.07 361.977C1344.71 485.26 1216.13 548.435 1097.36 595.361C1168.89 617.328 1260.19 624.704 1310.9 685.863C1427.8 822.67 1406.81 1092.02 1263.44 1206.17C1038.49 1385.25 846.416 1274.83 688.275 1097.04C615.115 990.262 588.853 944.848 560.024 816.621C507.959 897.382 456.47 955.205 376.297 1009.58C331.702 1039.83 258.475 1077.51 202.641 1065.36C171.63 1058.53 144.69 1039.48 127.936 1012.51C101.463 969.939 97.7112 890.895 110.871 844.532C152.188 698.984 224.515 633.906 344.27 560.237C233.835 572.11 142.807 567.14 60.0358 481.21C19.9155 440.306 -1.73452 384.78 0.108777 327.514C4.7818 181.855 148.607 136.652 271.725 143.72C398.411 150.992 502.741 195.987 588.721 289.817C552.651 143.07 616.842 56.4194 754.648 9.34294Z';

export type DaisyDotFlowerProps = {
  className?: string;
};

/**
 * Dot-matrix rendering of the daisy body (public/Vector.svg): the flower's
 * own bezier-curve outline filled with a tiled orange dot pattern, both
 * drawn as real SVG (not a CSS mask) so the silhouette stays smooth at any
 * size instead of picking up raster-mask aliasing.
 */
export default function DaisyDotFlower({ className }: DaisyDotFlowerProps) {
  const patternId = `daisy-dots-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg
      viewBox={VIEW_BOX}
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* 3x2 grid of differently-sized dots per tile, with a couple of
            light-gray ones mixed in so the repeat reads as scattered rather
            than a uniform orange grid. */}
        <pattern id={patternId} width="126" height="84" patternUnits="userSpaceOnUse">
          <circle cx="21" cy="21" r="16" fill="var(--color-orange-500)" />
          <circle cx="63" cy="21" r="9.5" fill="#d1d5db" />
          <circle cx="105" cy="21" r="13" fill="var(--color-orange-500)" />
          <circle cx="21" cy="63" r="10.5" fill="var(--color-orange-500)" />
          <circle cx="63" cy="63" r="17.5" fill="var(--color-orange-500)" />
          <circle cx="105" cy="63" r="12" fill="#d1d5db" />
        </pattern>
      </defs>
      <path d={VECTOR_D} fill={`url(#${patternId})`} />
    </svg>
  );
}
