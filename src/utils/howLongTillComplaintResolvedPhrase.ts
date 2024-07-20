import pluralize from 'pluralize';
import { ComplaintType } from '../types';
import { calculateTimeDifferenceUtil } from './calculateTimeDifferenceUtil'; // import the calculateTimeDifferenceUtil function

export const howLongTillComplaintResolvedPhrase = (complaint: ComplaintType): string | null => {
  // Get the time difference
  const timeDiff = calculateTimeDifferenceUtil(complaint);

  // Return appropriate message if the complaint is still open or not found
  if (!timeDiff) return 'Complaint is still open or not found';

  const { diffDays, diffHours, diffMinutes } = timeDiff;

  // If the issue is resolved in less than 1 hour, display only the minutes
  if (diffDays === 0 && diffHours === 0) {
    return `Issue resolved in: ${diffMinutes} ${pluralize('minute', diffMinutes)}`;
  }

  // Otherwise, display the days, hours, and minutes
  return `Issue resolved in: ${
    diffDays > 0 ? `${diffDays} ${pluralize('day', diffDays)}, ` : ''
  }${diffHours} ${pluralize('hour', diffHours)}, and ${diffMinutes} ${pluralize('minute', diffMinutes)}`;
};
