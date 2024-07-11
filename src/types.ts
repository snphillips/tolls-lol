export interface ComplaintType {
  unique_key: string;
  created_date: string;
  closed_date?: string;
  incident_address: string;
  status: 'In Progress' | 'Closed';
  resolution_description?: string;
  latitude?: string;
  longitude?: string;
}

export type ResolutionDescriptionType = {
  resolution?: string;
  label: string;
  color: string;
};

export type ResolutionDescriptionsArrayType = ResolutionDescriptionType[];

export type ResolutionDisplayType = {
  label: string;
  color: string;
  visibility: boolean;
};

export type DisplayResolutionArrayType = ResolutionDisplayType[];

export type setDisplayResolutionArrayType = React.Dispatch<React.SetStateAction<DisplayResolutionArrayType>>;
export type SetSelectedComplaintType = React.Dispatch<React.SetStateAction<ComplaintType | null>>;
