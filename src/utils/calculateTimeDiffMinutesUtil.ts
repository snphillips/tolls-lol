import { ComplaintType } from '../types';

export const calculateTimeDiffMinutesUtil = (complaint: ComplaintType): number | null => {
  if (!complaint) return null;

  const createdDate = new Date(complaint.created_date);
  if (!complaint.closed_date) return null;
  const closedDate = new Date(complaint.closed_date);

  const diffTime = closedDate.getTime() - createdDate.getTime();

  // Calculate the difference in minutes
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  return diffMinutes;
};
