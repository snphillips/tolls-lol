import pluralize from 'pluralize';
import { ComplaintType } from '../types';
import { calcTimeToResolveComplaintUtil } from './calcTimeToResolveComplaintUtil';

export const howLongTillResolvedPhraseUtil = (complaint: ComplaintType): string => {
  // Get the time difference
  const timeDiff = calcTimeToResolveComplaintUtil(complaint);

  // Return appropriate message if the complaint is still open or not found
  if (!timeDiff) return 'Complaint is still open';

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
