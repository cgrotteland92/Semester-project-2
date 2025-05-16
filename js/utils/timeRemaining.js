export function formatTimeRemaining(targetDate) {
  const now = new Date();
  let diff = targetDate - now;

  const isPast = diff <= 0;
  if (isPast) diff = now - targetDate;

  const msInMin = 60 * 1000;
  const msInHour = 60 * msInMin;
  const msInDay = 24 * msInHour;

  const days = Math.floor(diff / msInDay);
  const hours = Math.floor((diff % msInDay) / msInHour);
  const mins = Math.floor((diff % msInHour) / msInMin);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins) parts.push(`${mins}m`);
  const result = parts.join(" ") || "Less than a minute";

  return isPast ? `${result} ago` : result;
}

/**
 * Turns an end date into either "Ended" or a countdown string.
 */
export function renderEndsAt(date) {
  const now = Date.now();
  return date.getTime() < now
    ? "Ended"
    : `Ends in: ${formatTimeRemaining(date)}`;
}
