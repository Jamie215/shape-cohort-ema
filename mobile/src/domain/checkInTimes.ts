import { CheckInTimes } from './models';
export const defaultCheckInTimes: CheckInTimes = {
  morning: '08:00',
  afternoon: '13:00',
  evening: '20:00',
};
export function validCheckInTimes(value: unknown): value is CheckInTimes {
  if (!value || typeof value !== 'object') return false;
  const times = value as CheckInTimes;
  const ordered = [times.morning, times.afternoon, times.evening];
  if (
    !ordered.every(
      (time) =>
        typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time),
    )
  )
    return false;
  const minutes = ordered.map((time) => {
    const [hours, minute] = time.split(':').map(Number);
    return hours! * 60 + minute!;
  });
  const firstGap = (minutes[1]! - minutes[0]! + 1440) % 1440;
  const secondGap = (minutes[2]! - minutes[1]! + 1440) % 1440;
  return firstGap > 0 && secondGap > 0 && firstGap + secondGap < 1440;
}
export function displayCheckInTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = Number(hours);
  return `${hour % 12 || 12}:${minutes} ${hour < 12 ? 'AM' : 'PM'}`;
}
