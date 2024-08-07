export type statusType = 'In Progress' | 'Closed';

export interface ComplaintType {
  unique_key: string;
  created_date: string;
  closed_date?: string;
  incident_address: string;
  status: statusType;
  resolution_description?: string;
  latitude?: string;
  longitude?: string;
  timeDiffInMilliseconds?: number | null;
}

export type ResolutionLabelType = 'Complaint in progress' | 'Summons issued' | 'Summons not issued';

export type ColorTypes = 'orangeRed' | 'chartreuse' | 'mediumPurple';

export type ResolutionLabelColorType = {
  status: statusType;
  resolution?: string[] | undefined[] | `The Police Department issued a summons in response to the complaint.`;
  label: ResolutionLabelType;
  color: ColorTypes;
};

export type ResolutionCountsType = {
  'Complaint in progress': number;
  'Summons issued': number;
  'Summons not issued': number;
};

export type ResolutionLabelColorArrayType = ResolutionLabelColorType[];

export type ResolutionDisplayType = {
  label: ResolutionLabelType;
  visibility: boolean;
  count: number;
  percent: number;
};

export type DisplayResolutionArrayType = ResolutionDisplayType[];

export type SetDisplayResolutionArrayType = React.Dispatch<React.SetStateAction<DisplayResolutionArrayType>>;
export type SetSelectedComplaintType = React.Dispatch<React.SetStateAction<ComplaintType | null>>;
export type SetSliderResolutionTimeType = React.Dispatch<React.SetStateAction<number>>;
export type SetMinRangeTimeType = React.Dispatch<React.SetStateAction<number>>;
export type SetMaxAndUpRangeTimeType = React.Dispatch<React.SetStateAction<number>>;
export type SetRangeSliderResolutionTimeType = React.Dispatch<React.SetStateAction<number[]>>;
