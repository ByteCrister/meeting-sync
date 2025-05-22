export const getFormattedTimeZone = (): string => {
  const offsetInMinutes = new Date().getTimezoneOffset(); // e.g. -330 for UTC+5:30
  const sign = offsetInMinutes <= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(offsetInMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
  const minutes = String(absoluteMinutes % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
};
