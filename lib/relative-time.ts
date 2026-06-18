export const formatRelativeTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const elapsedSeconds = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 1000),
  );
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;

  if (elapsedSeconds < minute) {
    return `${elapsedSeconds}s`;
  }

  if (elapsedSeconds < hour) {
    return `${Math.floor(elapsedSeconds / minute)}m`;
  }

  if (elapsedSeconds < day) {
    return `${Math.floor(elapsedSeconds / hour)}h`;
  }

  if (elapsedSeconds < year) {
    return `${Math.floor(elapsedSeconds / day)}d`;
  }

  if (elapsedSeconds < year * 5) {
    return `${Math.floor(elapsedSeconds / year)}y`;
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};
