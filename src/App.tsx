/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ControlPanel from './ControlPanel';
import './App.css';
import {
  ComplaintType,
  DisplayResolutionArrayType,
  ResolutionLabel,
} from './types';
import { resolutionDescriptionsArray } from './ResolutionDescriptionsArray';

// City of NY Open Data API Endpoint
const dataURL =
  'https://data.cityofnewyork.us/resource/erm2-nwe9.json?$query=SELECT%0A%20%20%60unique_key%60%2C%0A%20%20%60created_date%60%2C%0A%20%20%60closed_date%60%2C%0A%20%20%60agency%60%2C%0A%20%20%60agency_name%60%2C%0A%20%20%60complaint_type%60%2C%0A%20%20%60descriptor%60%2C%0A%20%20%60location_type%60%2C%0A%20%20%60incident_zip%60%2C%0A%20%20%60incident_address%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60cross_street_1%60%2C%0A%20%20%60cross_street_2%60%2C%0A%20%20%60intersection_street_1%60%2C%0A%20%20%60intersection_street_2%60%2C%0A%20%20%60address_type%60%2C%0A%20%20%60city%60%2C%0A%20%20%60landmark%60%2C%0A%20%20%60facility_type%60%2C%0A%20%20%60status%60%2C%0A%20%20%60due_date%60%2C%0A%20%20%60resolution_description%60%2C%0A%20%20%60resolution_action_updated_date%60%2C%0A%20%20%60community_board%60%2C%0A%20%20%60bbl%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60x_coordinate_state_plane%60%2C%0A%20%20%60y_coordinate_state_plane%60%2C%0A%20%20%60open_data_channel_type%60%2C%0A%20%20%60park_facility_name%60%2C%0A%20%20%60park_borough%60%2C%0A%20%20%60vehicle_type%60%2C%0A%20%20%60taxi_company_borough%60%2C%0A%20%20%60taxi_pick_up_location%60%2C%0A%20%20%60bridge_highway_name%60%2C%0A%20%20%60bridge_highway_direction%60%2C%0A%20%20%60road_ramp%60%2C%0A%20%20%60bridge_highway_segment%60%2C%0A%20%20%60latitude%60%2C%0A%20%20%60longitude%60%2C%0A%20%20%60location%60%2C%0A%20%20%60%3A%40computed_region_efsh_h5xi%60%2C%0A%20%20%60%3A%40computed_region_f5dn_yrer%60%2C%0A%20%20%60%3A%40computed_region_yeji_bk3q%60%2C%0A%20%20%60%3A%40computed_region_92fq_4b7q%60%2C%0A%20%20%60%3A%40computed_region_sbqj_enih%60%2C%0A%20%20%60%3A%40computed_region_7mpf_4k6g%60%0AWHERE%0A%20%20caseless_one_of(%60complaint_type%60%2C%20%22Illegal%20Parking%22)%0A%20%20AND%20(caseless_one_of(%60descriptor%60%2C%20%22License%20Plate%20Obscured%22)%0A%20%20%20%20%20%20%20%20%20AND%20(%60created_date%60%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3E%20%222024-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp))%0AORDER%20BY%20%60created_date%60%20DESC%20NULL%20FIRST';
// const mapStyle = 'mapbox://styles/mapbox/streets-v12';
const mapStyle = 'mapbox://styles/mapbox/dark-v11';

function App() {
  const [viewport] = useState({
    latitude: 40.69093436877119,
    longitude: -73.960938659505,
    zoom: 11,
  });

  // 40.69211842795016, -73.960938659505
  const [complaints, setComplaints] = useState<ComplaintType[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<ComplaintType[]>(
    []
  );
  const [displayResolutionArray, setDisplayResolutionArray] =
    useState<DisplayResolutionArrayType>([
      {
        label: `View all Obscured License Plates complaints`,
        color: `#F4A698`, // pink
        visibility: true,
      },
      {
        label: `Complaint still open`,
        color: `#EBBC6F`, // earth yellow
        visibility: true,
      },
      {
        label: `Summons issued`,
        color: `#FF5964`, // red
        visibility: true,
      },
      {
        label: `Took action to fix the condition`,
        color: `#38618C`, // dark green
        visibility: true,
      },
      {
        label: `No evidence of the violation`,
        color: `#6B9080`, // orange
        visibility: true,
      },
      {
        label: `Not NYPD's jurisdiction`,
        color: `#B7B561`, // puce (replace)
        visibility: true,
      },
      {
        label: `Determined that action was not necessary`,
        color: `#6667E9`, // purple
        visibility: true,
      },
      {
        label: `Upon arrival those responsible were gone`,
        color: `#18C9C3`, // robin egg blue
        visibility: true,
      },
      {
        label: 'Provided additional information below',
        color: `#9A6D38`, // brown
        // color: `#F3F7F2`, // baby powder
        visibility: true,
      },
    ]);

  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintType | null>(null);

  const howLongTillComplaintResolved = (): string | null => {
    if (!selectedComplaint) return null;
    const createdDate = new Date(selectedComplaint.created_date);
    if (!selectedComplaint.closed_date) return 'Complaint is still open';
    const closedDate = new Date(selectedComplaint.closed_date);
    const diffTime = closedDate.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    return `Issue resolved in: ${
      diffDays > 0 ? `${diffDays} days, ` : ''
    }${diffHours} hours, and ${diffMinutes} minutes`;
  };

  const determineMarkerColor = (
    resolutionDescription: ResolutionLabel
  ): string => {
    const resolution = resolutionDescriptionsArray.find(
      (res) => res.resolution === resolutionDescription
    );
    return resolution ? resolution.color : 'black'; // Default to black if no match is found
  };

  useEffect(() => {
    fetch(dataURL)
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter(
          (item: ComplaintType) => item.latitude && item.longitude
        );
        setComplaints(filteredData);
        setFilteredComplaints(filteredData);
        console.log('Data:', data);
        console.log('filteredData:', filteredData);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const visibleLabels = displayResolutionArray
      .filter((item) => item.visibility)
      .map((item) => item.label);

    const visibleResolutions = resolutionDescriptionsArray
      .filter((item) => visibleLabels.includes(item.label))
      .map((item) => item.resolution);

    const filteredData = complaints.filter((complaint) => {
      if (complaint.resolution_description === undefined) {
        // Check if undefined (which corresponds to 'No resolution') is in the visibleResolutions
        return visibleResolutions.includes(undefined);
      }
      return visibleResolutions.includes(complaint.resolution_description);
    });

    setFilteredComplaints(filteredData);
  }, [displayResolutionArray, complaints]);

  return (
    <>
      <div id="map">
        <Map
          mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN}
          initialViewState={viewport}
          mapStyle={mapStyle}
        >
          {filteredComplaints.map((complaint) =>
            complaint.latitude && complaint.longitude ? (
              <Marker
                key={complaint.unique_key}
                latitude={parseFloat(complaint.latitude)}
                longitude={parseFloat(complaint.longitude)}
              >
                <button
                  className="marker-btn"
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      'clicked',
                      complaint.incident_address,
                      complaint.resolution_description
                    );
                    setSelectedComplaint(complaint);
                  }}
                >
                  <div
                    style={{
                      backgroundColor: determineMarkerColor(
                        complaint.resolution_description as ResolutionLabel
                      ),
                    }}
                    className="marker"
                  ></div>
                </button>
              </Marker>
            ) : null
          )}
          {selectedComplaint &&
            selectedComplaint.latitude &&
            selectedComplaint.longitude && (
              <Popup
                latitude={parseFloat(selectedComplaint.latitude)}
                longitude={parseFloat(selectedComplaint.longitude)}
                onClose={() => setSelectedComplaint(null)}
                closeOnClick={false}
                closeButton={true}
              >
                <div className="popup-container">
                  <h3 id="incident_address">
                    {selectedComplaint.incident_address
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </h3>
                  <h4>Complaint opened:</h4>
                  <p className="popup-content">
                    {new Date(selectedComplaint.created_date).toLocaleString(
                      'en-us',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                  <h4>Complaint closed:</h4>
                  <p className="popup-content">
                    {selectedComplaint.closed_date
                      ? new Date(selectedComplaint.closed_date).toLocaleString(
                          'en-us',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )
                      : 'Complaint is still open'}
                  </p>
                  <h4>Complaint Resolution:</h4>
                  <p className="popup-content">
                    {selectedComplaint.resolution_description}
                  </p>
                  <p>
                    {selectedComplaint.closed_date
                      ? howLongTillComplaintResolved()
                      : ''}
                  </p>
                  <h4>
                    Responding Precinct:{' '}
                    {/* this isn't right but maybe I'm not understanding what the data is meant to be */}
                    {selectedComplaint[':@computed_region_7mpf_4k6g']}
                  </h4>
                </div>
              </Popup>
            )}
          <ControlPanel
            displayResolutionArray={displayResolutionArray}
            setDisplayResolutionArray={setDisplayResolutionArray}
          />
        </Map>
      </div>
    </>
  );
}

export default App;
