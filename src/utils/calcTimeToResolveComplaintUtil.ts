import { ComplaintType } from '../types';

export const calcTimeToResolveComplaintUtil = (complaint: ComplaintType) => {
  // Return null if no complaint is selected
  if (!complaint) return null;

  // Parse the creation and closure dates of the complaint
  const createdDate = new Date(complaint.created_date);
  if (!complaint.closed_date) return null;
  const closedDate = new Date(complaint.closed_date);

  // Calculate the time difference between creation and closure in milliseconds
  const diffTime = closedDate.getTime() - createdDate.getTime();

  // Calculate the difference in days, hours, and minutes
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  return { diffDays, diffHours, diffMinutes };
};
