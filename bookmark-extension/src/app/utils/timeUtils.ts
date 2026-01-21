const NEW_THRESHOLD_MINUTES = 5;
const ONE_MINUTE_IN_MS = 1000 * 60;

export function isRecentlyAdded(dateAdded: number | undefined) {
  if (!dateAdded) return false;

  const createAt = new Date(dateAdded);
  const now = new Date();
  const diffInMs = now.getTime() - createAt.getTime();
  const diffInMinutes = diffInMs / ONE_MINUTE_IN_MS;

  return diffInMinutes <= NEW_THRESHOLD_MINUTES;
}
