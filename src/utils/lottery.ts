export interface PrizeTier {
  amt: string;
  w: number;
  isJackpot?: boolean;
}

export const TIERS: PrizeTier[] = [
  { amt: "Bs. 3.000", w: 1, isJackpot: true },
  { amt: "Bs. 2.000", w: 3 },
  { amt: "Bs. 1.000", w: 7 },
  { amt: "Bs. 500",   w: 14 },
  { amt: "Bs. 250",   w: 28 },
  { amt: "Bs. 100",   w: 47 },
];

export function drawPrize(): PrizeTier {
  const total = TIERS.reduce((s, t) => s + t.w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < TIERS.length; i++) {
    r -= TIERS[i].w;
    if (r <= 0) return TIERS[i];
  }
  return TIERS[TIERS.length - 1];
}
