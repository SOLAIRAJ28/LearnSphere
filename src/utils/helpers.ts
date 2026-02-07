// Convert minutes to HH:MM format
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Convert HH:MM format to minutes
export const parseDuration = (duration: string): number => {
  const [hours, minutes] = duration.split(':').map(Number);
  return (hours * 60) + minutes;
};
