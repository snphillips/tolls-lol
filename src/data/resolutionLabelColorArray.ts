export const allOtherResolutionsArray = [
  'The Police Department responded and upon arrival those responsible for the condition were gone.',
  'The Police Department responded to the complaint and a report was prepared.',
  'The Police Department responded to the complaint and determined that police action was not necessary.',
  `The Police Department responded to the complaint and took action to fix the condition.`,
  `The Police Department responded to the complaint and with the information available observed no evidence of the violation at that time.`,
  'The Police Department responded to the complaint but officers were unable to gain entry into the premises.',
  'The Police Department reviewed your complaint and provided additional information below.',
  `This complaint does not fall under the Police Department's jurisdiction.`,
  `Your request can not be processed at this time because of insufficient contact information. Please create a new Service Request on NYC.gov and provide more detailed contact information.`,
];

export const resolutionLabelColorArray = [
  {
    status: 'In Progress',
    resolution: undefined,
    label: `Complaint still in progress`,
    color: `gold`,
  },
  {
    status: 'Closed',
    resolution: `The Police Department issued a summons in response to the complaint.`,
    label: `Summons issued`,
    color: `chartreuse`,
  },
  {
    status: 'Closed',
    resolution: allOtherResolutionsArray,
    label: `Summons not issued`,
    color: `mediumPurple`,
  },
];
