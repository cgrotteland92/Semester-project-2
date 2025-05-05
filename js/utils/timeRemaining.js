export function formatTimeRemaining(endDate) {
  const now = new Date();
  const diff = endDate - now;
  if (diff <= 0) return "Ended";

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
  return parts.join(" ") || "Less than a minute";
}
