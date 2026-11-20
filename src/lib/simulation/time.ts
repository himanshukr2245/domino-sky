/** IST minutes from the supplied operating day's midnight; independent of browser timezone. */
export function parseTime(value: string): number {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error(`Invalid IST time: ${value}`);
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatTime(value: number): string {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Time must be nonnegative integer minutes.');
  const day = Math.floor(value / 1440);
  const minute = value % 1440;
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}${day ? ` +${day}d` : ''}`;
}
