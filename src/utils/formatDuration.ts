/* Breaks milliseconds down into days, hours, and minutes.
 *
 * @param {number} duration - The duration in milliseconds.
 * @return {Duration} An object containing the days, hours, and minutes.
 */
interface formattedDurationType {
  days: number;
  hours: number;
  minutes: number;
}

export const formatDuration = (durationInMilliSecs: number): formattedDurationType => {
  const days = Math.floor(durationInMilliSecs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((durationInMilliSecs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((durationInMilliSecs % (1000 * 60 * 60)) / (1000 * 60));

  return { days: days, hours: hours, minutes: minutes };
};
