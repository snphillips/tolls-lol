import React from 'react';
import './ControlPanel.css';
import { 
  ResolutionDescriptionsArrayType
}  
from './types.ts';

type Props = {
  resolutionDescriptionsArray: ResolutionDescriptionsArrayType;
  setResolutionDescriptionsArray: any;
};

function ControlPanel({ resolutionDescriptionsArray, setResolutionDescriptionsArray}: Props) {

      const handleCheckboxChange = (label: string) => {
        console.log('handleCheckboxChange', label);
        setResolutionDescriptionsArray(prevState =>
          prevState.map(resolutionDescription =>
            resolutionDescription.label === label
              ? { ...resolutionDescription, visibility: !resolutionDescription.visibility }
              : resolutionDescription
          )
        );
      };

  return (
    <div className="control-panel">
      <h1>Obscured License Plates in NYC</h1>
      <h2>Visualizing 311 Complaint Data for 2024</h2>
      <div>
        <a
          className="source-link"
          href="https://github.com/snphillips/obscured-license-plate-visualizer.git"
          target="_new"
          >
          View Code ↗
        </a>
        <a
          className="source-link"
          href="https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9/explore/query/SELECT%0A%20%20%60unique_key%60%2C%0A%20%20%60created_date%60%2C%0A%20%20%60closed_date%60%2C%0A%20%20%60agency%60%2C%0A%20%20%60agency_name%60%2C%0A%20%20%60complaint_type%60%2C%0A%20%20%60descriptor%60%2C%0A%20%20%60location_type%60%2C%0A%20%20%60incident_zip%60%2C%0A%20%20%60incident_address%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60cross_street_1%60%2C%0A%20%20%60cross_street_2%60%2C%0A%20%20%60intersection_street_1%60%2C%0A%20%20%60intersection_street_2%60%2C%0A%20%20%60address_type%60%2C%0A%20%20%60city%60%2C%0A%20%20%60landmark%60%2C%0A%20%20%60facility_type%60%2C%0A%20%20%60status%60%2C%0A%20%20%60due_date%60%2C%0A%20%20%60resolution_description%60%2C%0A%20%20%60resolution_action_updated_date%60%2C%0A%20%20%60community_board%60%2C%0A%20%20%60bbl%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60x_coordinate_state_plane%60%2C%0A%20%20%60y_coordinate_state_plane%60%2C%0A%20%20%60open_data_channel_type%60%2C%0A%20%20%60park_facility_name%60%2C%0A%20%20%60park_borough%60%2C%0A%20%20%60vehicle_type%60%2C%0A%20%20%60taxi_company_borough%60%2C%0A%20%20%60taxi_pick_up_location%60%2C%0A%20%20%60bridge_highway_name%60%2C%0A%20%20%60bridge_highway_direction%60%2C%0A%20%20%60road_ramp%60%2C%0A%20%20%60bridge_highway_segment%60%2C%0A%20%20%60latitude%60%2C%0A%20%20%60longitude%60%2C%0A%20%20%60location%60%2C%0A%20%20%60%3A%40computed_region_efsh_h5xi%60%2C%0A%20%20%60%3A%40computed_region_f5dn_yrer%60%2C%0A%20%20%60%3A%40computed_region_yeji_bk3q%60%2C%0A%20%20%60%3A%40computed_region_92fq_4b7q%60%2C%0A%20%20%60%3A%40computed_region_sbqj_enih%60%2C%0A%20%20%60%3A%40computed_region_7mpf_4k6g%60%0AWHERE%0A%20%20caseless_one_of(%60complaint_type%60%2C%20%22Illegal%20Parking%22)%0A%20%20AND%20(caseless_one_of(%60descriptor%60%2C%20%22License%20Plate%20Obscured%22)%0A%20%20%20%20%20%20%20%20%20AND%20(%60created_date%60%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3E%20%222023-12-31T08%3A24%3A14%22%20%3A%3A%20floating_timestamp))%0AORDER%20BY%20%60created_date%60%20DESC%20NULL%20FIRST"
          target="_new"
        >
          View Source Data ↗
        </a>
      </div>
      <hr />
      <h3>Resolution</h3>



      {
  resolutionDescriptionsArray.map((resolutionDescription) => (
    <div key={resolutionDescription.label} className="input">
      <label>{resolutionDescription.label}</label>
      <input
        type="checkbox"
        checked={resolutionDescription.visibility}
        onChange={() => handleCheckboxChange(resolutionDescription.label)}
      />
    </div>
  ))
}

      <h3>Time to Resolution</h3>
      {/* https://visgl.github.io/react-map-gl/examples/geojson */}
      <input type="range" min="1" max="100" value='50'/>
    </div>
  );
}

export default ControlPanel;
