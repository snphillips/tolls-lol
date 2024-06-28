// const howLongTillComplaintResolved = (): string | null => {
//   if (!selectedComplaint) return null;

//   const createdDate = new Date(selectedComplaint.created_date);
//   if (!selectedComplaint.closed_date) return 'Complaint is still open';
  
//   const closedDate = new Date(selectedComplaint.closed_date);

//   const diffTime = closedDate.getTime() - createdDate.getTime();
//   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 

//   const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//   const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

//   return `${diffDays > 0 ? `${diffDays} days, ` : ''}${diffHours} hours, and ${diffMinutes} minutes`;
// }
