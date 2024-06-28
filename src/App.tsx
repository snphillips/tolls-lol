import React, {useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ControlPanel from './ControlPanel';
import './App.css';
import { 
  ComplaintType,
  ResolutionDescriptionsType,
  DisplayResolutionType,
}  
from './types.ts';

// City of NY Open Data API Endpoint
const dataURL = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json?$query=SELECT%0A%20%20%60unique_key%60%2C%0A%20%20%60created_date%60%2C%0A%20%20%60closed_date%60%2C%0A%20%20%60agency%60%2C%0A%20%20%60agency_name%60%2C%0A%20%20%60complaint_type%60%2C%0A%20%20%60descriptor%60%2C%0A%20%20%60location_type%60%2C%0A%20%20%60incident_zip%60%2C%0A%20%20%60incident_address%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60cross_street_1%60%2C%0A%20%20%60cross_street_2%60%2C%0A%20%20%60intersection_street_1%60%2C%0A%20%20%60intersection_street_2%60%2C%0A%20%20%60address_type%60%2C%0A%20%20%60city%60%2C%0A%20%20%60landmark%60%2C%0A%20%20%60facility_type%60%2C%0A%20%20%60status%60%2C%0A%20%20%60due_date%60%2C%0A%20%20%60resolution_description%60%2C%0A%20%20%60resolution_action_updated_date%60%2C%0A%20%20%60community_board%60%2C%0A%20%20%60bbl%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60x_coordinate_state_plane%60%2C%0A%20%20%60y_coordinate_state_plane%60%2C%0A%20%20%60open_data_channel_type%60%2C%0A%20%20%60park_facility_name%60%2C%0A%20%20%60park_borough%60%2C%0A%20%20%60vehicle_type%60%2C%0A%20%20%60taxi_company_borough%60%2C%0A%20%20%60taxi_pick_up_location%60%2C%0A%20%20%60bridge_highway_name%60%2C%0A%20%20%60bridge_highway_direction%60%2C%0A%20%20%60road_ramp%60%2C%0A%20%20%60bridge_highway_segment%60%2C%0A%20%20%60latitude%60%2C%0A%20%20%60longitude%60%2C%0A%20%20%60location%60%2C%0A%20%20%60%3A%40computed_region_efsh_h5xi%60%2C%0A%20%20%60%3A%40computed_region_f5dn_yrer%60%2C%0A%20%20%60%3A%40computed_region_yeji_bk3q%60%2C%0A%20%20%60%3A%40computed_region_92fq_4b7q%60%2C%0A%20%20%60%3A%40computed_region_sbqj_enih%60%2C%0A%20%20%60%3A%40computed_region_7mpf_4k6g%60%0AWHERE%0A%20%20caseless_one_of(%60complaint_type%60%2C%20%22Illegal%20Parking%22)%0A%20%20AND%20(caseless_one_of(%60descriptor%60%2C%20%22License%20Plate%20Obscured%22)%0A%20%20%20%20%20%20%20%20%20AND%20(%60created_date%60%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3E%20%222023-12-31T08%3A24%3A14%22%20%3A%3A%20floating_timestamp))%0AORDER%20BY%20%60created_date%60%20DESC%20NULL%20FIRST'

const resolutionDescriptions: ResolutionDescriptionsType = {
  no_resolution: 'No resolution',
  summons: 'Issued a summons in response to the complaint',
  took_action: 'Took action to fix the condition',
  no_violation: 'No evidence of violation',
  not_police_jurisdiction: 'Does not fall under the NYPD\'s jurisdiction', 
  no_police_action: 'Police action was not necessary',
  those_responsible_gone: 'Those responsible for the condition were gone',
  provided_additional_information: 'Provided additional information below'
};


function App() {
  // TODO: change viewport depending on screen size?
  const [viewport, setViewport] = useState({
    latitude: 40.69093436877119,
    longitude: -73.91433620220114,
    zoom: 11,
  });
  const [complaints, setComplaints] = useState<ComplaintType[]>([]);
  // const [filteredComplaints, setFilteredComplaints] = useState<ComplaintType[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintType | null>(null);
  const [displayResolution, setDisplayResolution] = useState<DisplayResolutionType>({
    no_resolution: true,
    summons: true,
    took_action: true,
    no_violation: true,
    not_police_jurisdiction: true,
    no_police_action: true,
    those_responsible_gone: true,
    provided_additional_information: true
  });

const howLongTillComplaintResolved = (): string | null => {
  if (!selectedComplaint) return null;
  const createdDate = new Date(selectedComplaint.created_date);
  if (!selectedComplaint.closed_date) return 'Complaint is still open';
  const closedDate = new Date(selectedComplaint.closed_date);
  const diffTime = closedDate.getTime() - createdDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  return `Issue resolved in: ${diffDays > 0 ? `${diffDays} days, ` : ''}${diffHours} hours, and ${diffMinutes} minutes`;
}

  useEffect(() => {
    fetch(dataURL)
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter((item: any) => item.latitude && item.longitude);
        setComplaints(filteredData);
        console.log('Data:', data);
        console.log('filteredData:', filteredData);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    console.log("displayResolution changed");
    const newFilteredComplaints = complaints.filter((complaint) => {
      const resolutionDescription = complaint.resolution_description as keyof DisplayResolutionType;
      return displayResolution[resolutionDescription];
    });
    setComplaints(newFilteredComplaints);
  }, [displayResolution]);

  return (
    <>
      <div id='map'>
        <Map
          mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN}
          initialViewState={viewport}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {complaints.map((complaint) => (
            <div>
            <Marker
              key={complaint.unique_key}
              latitude={parseFloat(complaint.latitude)}
              longitude={parseFloat(complaint.longitude)}
            >
              <button 
                className="marker-btn"
                onClick={(event) => {
                  event.preventDefault()
                  console.log('clicked', complaint.incident_address, complaint.resolution_description);
                  setSelectedComplaint(complaint);
                }}
                >
              <div className="marker"></div>
              </button>
            </Marker>
            </div>
          ))}
          {selectedComplaint && (
            <Popup
              latitude={parseFloat(selectedComplaint.latitude)}
              longitude={parseFloat(selectedComplaint.longitude)}
              onClose={() => setSelectedComplaint(null)}
              closeOnClick={false}
              closeButton={true}
            >
              <div className="popup-content">
                <h3>{selectedComplaint.incident_address}</h3>
                <p>Complaint opened: {new Date(selectedComplaint.created_date).toLocaleString('en-us', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p>Complaint closed:
                  {selectedComplaint.closed_date ? 
                    new Date(selectedComplaint.closed_date).toLocaleString('en-us', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 
                    'Complaint is still open'
                  }
                </p>
                <p>{selectedComplaint.resolution_description}</p>
                <p>{selectedComplaint.closed_date ? howLongTillComplaintResolved()
                : ''}
                </p>
              </div>
            </Popup>
          )}
          <ControlPanel 
            resolutionDescriptions={resolutionDescriptions} 
            displayResolution={displayResolution} 
            setDisplayResolution={setDisplayResolution}
            />
        </Map>
      </div>
    </>
  );
}

export default App;
