export interface ComplaintType {
  unique_key: string;
  created_date: string;
  closed_date?: string;
  agency: 'NYPD';
  agency_name: 'New York City Police Department';
  complaint_type: 'Illegal Parking';
  descriptor: 'License Plate Obscured';
  location_type: string;
  incident_zip: string;
  incident_address: string;
  street_name: string;
  cross_street_1?: string;
  cross_street_2?: string;
  intersection_street_1?: string;
  intersection_street_2?: string;
  address_type: string;
  city?: string;
  landmark?: string;
  facility_type: undefined;
  status: 'In Progress' | 'Closed';
  due_date: undefined;
  resolution_description?: string;
  resolution_action_updated_date?: string;
  community_board: string;
  bbl?: string;
  borough: string;
  x_coordinate_state_plane?: string;
  y_coordinate_state_plane?: string;
  open_data_channel_type: 'MOBILE' | 'ONLINE' | 'MOBILE';
  park_facility_name: 'Unspecified';
  park_borough: 'BROOKLYN' | 'BRONX' | 'QUEENS' | 'MANHATTAN' | 'STATEN ISLAND';
  vehicle_type?: string;
  taxi_company_borough?: string;
  taxi_pick_up_location?: string;
  bridge_highway_name?: string;
  bridge_highway_direction?: string;
  road_ramp?: string;
  bridge_highway_segment?: string;
  latitude?: string;
  longitude?: string;
  location?: {
    latitude: string;
    longitude: string;
  };
  zip_codes?: string;
  community_districts?: string;
  borough_boundaries?: '1' | '2' | '3' | '4' | '5';
  city_council_districts?: string;
  police_precincts?: string;
  police_precinct?: string;
}

export type ResolutionDescriptionsType = {
  no_resolution: string;
  summons: string;
  took_action: string;
  no_violation: string;
  not_police_jurisdiction: string;
  no_police_action: string;
  those_responsible_gone: string;
  provided_additional_information: string;
};

export type ResolutionDescriptionType = {
  resolution?: string;
  label: string;
  color: string;
};

export type ResolutionDescriptionsArrayType = ResolutionDescriptionType[];

export type DisplayResolutionType = {
  label: string;
  visibility: boolean;
};

export type DisplayResolutionArrayType = DisplayResolutionType[];
