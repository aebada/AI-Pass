/** Seeded PRNG for reproducible synthetic hospitals. */
export class SeededRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 1;
  }

  next(): number {
    // LCG — deterministic across Node and browser
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)]!;
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Deterministic hex id fragment (SSR/client-safe; no Date/Math.random). */
  hex(length = 8): string {
    let out = '';
    while (out.length < length) {
      out += Math.floor(this.next() * 0x100000000)
        .toString(16)
        .padStart(8, '0');
    }
    return out.slice(0, length);
  }
}
