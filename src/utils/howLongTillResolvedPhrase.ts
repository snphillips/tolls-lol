import pluralize from 'pluralize';
import { ComplaintType } from '../types';
import { calcTimeToResolveComplaintInMilliSeconds } from './calcTimeToResolveComplaintInMilliSeconds';
import { formatDuration } from './formatDuration';

export const howLongTillResolvedPhrase = (complaint: ComplaintType): string => {
  const timeDiffInMilliseconds = calcTimeToResolveComplaintInMilliSeconds(complaint);

  if (!timeDiffInMilliseconds) return 'Complaint is still open';

  const { days, hours, minutes } = formatDuration(timeDiffInMilliseconds);

  // If the issue is resolved in less than 1 hour, display only the minutes
  if (days === 0 && hours === 0) {
    return `Issue resolved in: ${minutes} ${pluralize('minute', minutes)}`;
  }

  // Otherwise, display the days, hours, and minutes
  return `Issue resolved in: ${days > 0 ? `${days} ${pluralize('day', days)}, ` : ''}${hours} ${pluralize(
    'hour',
    hours
  )}, and ${minutes} ${pluralize('minute', minutes)}`;
};
