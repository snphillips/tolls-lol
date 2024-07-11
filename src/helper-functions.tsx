import pluralize from 'pluralize';
import { ComplaintType, ResolutionDescriptionsArrayType } from './types';

export const howLongTillComplaintResolved = (selectedComplaint: ComplaintType): string | null => {
  // Return null if no complaint is selected
  if (!selectedComplaint) return null;

  // Parse the creation and closure dates of the complaint
  const createdDate = new Date(selectedComplaint.created_date);
  if (!selectedComplaint.closed_date) return 'Complaint is still open';
  const closedDate = new Date(selectedComplaint.closed_date);

  // Calculate the time difference between creation and closure in milliseconds
  const diffTime = closedDate.getTime() - createdDate.getTime();

  // Calculate the difference in days, hours, and minutes
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  // If the issue is resolved in less than 1 hour, display only the minutes
  if (diffDays === 0 && diffHours === 0) {
    return `Issue resolved in: ${diffMinutes} ${pluralize('minute', diffMinutes)}`;
  }

  // Otherwise, display the days, hours, and minutes
  return `Issue resolved in: ${diffDays > 0 ? `${diffDays} ${pluralize('day', diffDays)}, ` : ''}${diffHours} ${pluralize(
    'hour',
    diffHours
  )}, and ${diffMinutes} ${pluralize('minute', diffMinutes)}`;
};

export const determineMarkerColor = (
  resolutionDescription: string,
  resolutionDescriptionsArray: ResolutionDescriptionsArrayType
): string => {
  const resolution = resolutionDescriptionsArray.find((res) => res.resolution === resolutionDescription);
  return resolution ? resolution.color : 'white'; // Default to white if no match is found
};
