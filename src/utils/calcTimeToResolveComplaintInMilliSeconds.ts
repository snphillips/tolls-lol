import { ComplaintType } from '../types';

export const calcTimeToResolveComplaintInMilliSeconds = (complaint: ComplaintType): number | null => {
  if (!complaint) return null;

  const createdDate = new Date(complaint.created_date);
  if (!complaint.closed_date) return null;
  const closedDate = new Date(complaint.closed_date);

  const diffTimeInMilliSecs = closedDate.getTime() - createdDate.getTime();
  return diffTimeInMilliSecs;
};
