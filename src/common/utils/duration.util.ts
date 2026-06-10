const DURATION_PATTERN = /^(\d+)([smhd])$/i;

const MULTIPLIERS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
};

export function durationToSeconds(
  value: string,
  fallbackValue: string,
): number {
  const source = value?.trim() || fallbackValue;
  const match = DURATION_PATTERN.exec(source);

  if (!match) {
    const parsedInt = Number(source);
    if (!Number.isFinite(parsedInt) || parsedInt <= 0) {
      throw new Error(`Invalid duration: "${source}"`);
    }

    return Math.floor(parsedInt);
  }

  const numeric = Number(match[1]);
  const unit = match[2].toLowerCase();
  return numeric * MULTIPLIERS[unit];
}
