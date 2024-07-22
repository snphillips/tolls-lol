export interface ComplaintType {
  unique_key: string;
  created_date: string;
  closed_date?: string;
  incident_address: string;
  status: 'In Progress' | 'Closed' | string;
  resolution_description?: string;
  latitude?: string;
  longitude?: string;
  timeDiffInMilliSeconds?: number | null;
}

export type ResolutionLabelColorType = {
  status: 'In Progress' | 'Closed' | string;
  resolution?: string[] | undefined[] | string;
  label: string;
  color: string;
  borderColor: string;
};

export type resolutionLabelColorArrayType = ResolutionLabelColorType[];

export type ResolutionDisplayType = {
  label: string;
  visibility: boolean;
};

export type DisplayResolutionArrayType = ResolutionDisplayType[];

export type setDisplayResolutionArrayType = React.Dispatch<React.SetStateAction<DisplayResolutionArrayType>>;
export type SetSelectedComplaintType = React.Dispatch<React.SetStateAction<ComplaintType | null>>;
export type setResolutionTimeInMinsType = React.Dispatch<React.SetStateAction<number | string | undefined>>;
export type minTimeInMillisecondsType = number;
export type maxTimeInMillisecondsType = number;
export type setMinTimeInMillisecondsType = React.Dispatch<React.SetStateAction<minTimeInMillisecondsType>>;
export type setMaxTimeInMillisecondsType = React.Dispatch<React.SetStateAction<maxTimeInMillisecondsType>>;
