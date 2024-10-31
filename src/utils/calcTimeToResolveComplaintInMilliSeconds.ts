export interface ComplaintType {
  unique_key: string;
  created_date: string;
  closed_date?: string;
  incident_address: string;
  status: 'In Progress' | 'Closed';
  resolution_description?: string;
  latitude?: string;
  longitude?: string;
  timeDiffInMilliseconds?: number | null;
}

export const calcTimeToResolveComplaintInMilliSeconds = (complaint: ComplaintType): number | null => {
  if (!complaint) return null;

  const createdDate = new Date(complaint.created_date);
  if (!complaint.closed_date) return null;
  const closedDate = new Date(complaint.closed_date);

  const diffTimeInMilliSecs = closedDate.getTime() - createdDate.getTime();
  return diffTimeInMilliSecs;
};
