// Seeded RNG utilities: mulberry32 + seeded shuffle and pick
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickN(arr, n, rand) {
  if (n >= arr.length) return arr.slice();
  const a = seededShuffle(arr, rand);
  return a.slice(0, n);
}

// small helper to get an int from a number or string seed
export function normalizeSeed(seed) {
  if (typeof seed === 'number') return seed;
  if (!seed) return 42;
  // simple string hash
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h) + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}