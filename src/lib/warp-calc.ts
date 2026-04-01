export type BannerType = 'character' | 'lightcone';

export function getRate(pity: number, type: BannerType) {
  if (type === 'character') {
    if (pity < 74) return 0.006;
    if (pity >= 90) return 1.0;
    return 0.006 + 0.06 * (pity - 73);
  } else {
    if (pity < 64) return 0.008;
    if (pity >= 80) return 1.0;
    return 0.008 + 0.07 * (pity - 63);
  }
}

export function calculateWarpProbabilities(
  currentPity: number,
  isGuaranteed: boolean,
  targetCopies: number,
  maxPulls: number = 2000,
  bannerType: BannerType = 'character'
): number[] {
  const maxPity = bannerType === 'character' ? 90 : 80;
  const winRate = bannerType === 'character' ? 0.5 : 0.75;

  currentPity = Math.max(0, Math.min(maxPity - 1, currentPity));
  targetCopies = Math.max(1, Math.min(7, targetCopies));

  let state = Array.from({ length: maxPity }, () =>
    Array.from({ length: 2 }, () => new Float64Array(targetCopies))
  );

  state[currentPity][isGuaranteed ? 1 : 0][0] = 1.0;

  const cumulativeProbs: number[] = [0];
  let successProb = 0;

  for (let step = 1; step <= maxPulls; step++) {
    let nextState = Array.from({ length: maxPity }, () =>
      Array.from({ length: 2 }, () => new Float64Array(targetCopies))
    );

    for (let p = 0; p < maxPity; p++) {
      const rate = getRate(p + 1, bannerType);
      for (let g = 0; g < 2; g++) {
        for (let t = 0; t < targetCopies; t++) {
          const prob = state[p][g][t];
          if (prob === 0) continue;

          if (p + 1 < maxPity) {
            nextState[p + 1][g][t] += prob * (1 - rate);
          }

          if (g === 1) {
            if (t + 1 === targetCopies) {
              successProb += prob * rate;
            } else {
              nextState[0][0][t + 1] += prob * rate;
            }
          } else {
            if (t + 1 === targetCopies) {
              successProb += prob * rate * winRate;
            } else {
              nextState[0][0][t + 1] += prob * rate * winRate;
            }
            nextState[0][1][t] += prob * rate * (1 - winRate);
          }
        }
      }
    }
    state = nextState;
    cumulativeProbs.push(successProb);

    if (successProb > 0.99999) {
      for (let i = step + 1; i <= maxPulls; i++) {
        cumulativeProbs.push(1);
      }
      break;
    }
  }

  return cumulativeProbs;
}
