import { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ControlPanel from './ControlPanel';
import './App.css';

// City of NY Open Data API Endpoint
const dataURL = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json?$query=SELECT%0A%20%20%60unique_key%60%2C%0A%20%20%60created_date%60%2C%0A%20%20%60closed_date%60%2C%0A%20%20%60agency%60%2C%0A%20%20%60agency_name%60%2C%0A%20%20%60complaint_type%60%2C%0A%20%20%60descriptor%60%2C%0A%20%20%60location_type%60%2C%0A%20%20%60incident_zip%60%2C%0A%20%20%60incident_address%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60cross_street_1%60%2C%0A%20%20%60cross_street_2%60%2C%0A%20%20%60intersection_street_1%60%2C%0A%20%20%60intersection_street_2%60%2C%0A%20%20%60address_type%60%2C%0A%20%20%60city%60%2C%0A%20%20%60landmark%60%2C%0A%20%20%60facility_type%60%2C%0A%20%20%60status%60%2C%0A%20%20%60due_date%60%2C%0A%20%20%60resolution_description%60%2C%0A%20%20%60resolution_action_updated_date%60%2C%0A%20%20%60community_board%60%2C%0A%20%20%60bbl%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60x_coordinate_state_plane%60%2C%0A%20%20%60y_coordinate_state_plane%60%2C%0A%20%20%60open_data_channel_type%60%2C%0A%20%20%60park_facility_name%60%2C%0A%20%20%60park_borough%60%2C%0A%20%20%60vehicle_type%60%2C%0A%20%20%60taxi_company_borough%60%2C%0A%20%20%60taxi_pick_up_location%60%2C%0A%20%20%60bridge_highway_name%60%2C%0A%20%20%60bridge_highway_direction%60%2C%0A%20%20%60road_ramp%60%2C%0A%20%20%60bridge_highway_segment%60%2C%0A%20%20%60latitude%60%2C%0A%20%20%60longitude%60%2C%0A%20%20%60location%60%2C%0A%20%20%60%3A%40computed_region_efsh_h5xi%60%2C%0A%20%20%60%3A%40computed_region_f5dn_yrer%60%2C%0A%20%20%60%3A%40computed_region_yeji_bk3q%60%2C%0A%20%20%60%3A%40computed_region_92fq_4b7q%60%2C%0A%20%20%60%3A%40computed_region_sbqj_enih%60%2C%0A%20%20%60%3A%40computed_region_7mpf_4k6g%60%0AWHERE%0A%20%20caseless_one_of(%60complaint_type%60%2C%20%22Illegal%20Parking%22)%0A%20%20AND%20(caseless_one_of(%60descriptor%60%2C%20%22License%20Plate%20Obscured%22)%0A%20%20%20%20%20%20%20%20%20AND%20(%60created_date%60%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3E%20%222023-12-31T08%3A24%3A14%22%20%3A%3A%20floating_timestamp))%0AORDER%20BY%20%60created_date%60%20DESC%20NULL%20FIRST'

interface Report {
  unique_key: string;
  incident_address: string;
  latitude: string;
  longitude: string;
  police_precint: string;
  created_date: string;
  closed_date: string;
  resolution_description: string;
}

function App() {
  const [viewport, setViewport] = useState({
    latitude: 40.69093436877119,
    longitude: -73.91433620220114,
    zoom: 11,
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetch(dataURL)
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter((item: any) => item.latitude && item.longitude);
        setReports(filteredData);
        console.log('Data:', data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const howLongTillResolved = (): string | null => {
    if (!selectedReport) return null;
    const createdDate = new Date(selectedReport.created_date);
    const closedDate = new Date(selectedReport.closed_date);

    const diffTime = closedDate.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 

    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffDays > 0 ? `${diffDays} days, ` : ''}${diffHours} hours, and ${diffMinutes} minutes`;
  }

  return (
    <>
      <div id='map'>
        <Map
          mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN}
          initialViewState={viewport}
          style={{ 
            // width: 800, 
            // height: 800 
          }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {reports.map((report) => (
            <div>
            <Marker
              key={report.unique_key}
              latitude={parseFloat(report.latitude)}
              longitude={parseFloat(report.longitude)}
            >
              <button 
                className="marker-btn"
                onClick={(e) => {
                  e.preventDefault()
                  console.log('clicked', report.incident_address, report.resolution_description);
                  setSelectedReport(report);
                }}
                >
              <div className="marker"></div>
              </button>
            </Marker>
            {/* <Circle
              key={report.unique_key}
              latitude={parseFloat(report.latitude)}
              longitude={parseFloat(report.longitude)}
            >
              <button 
                className="marker-btn"
                onClick={(e) => {
                  e.preventDefault()
                  console.log('clicked', report.incident_address, report.resolution_description);
                  setSelectedReport(report);
                }}
                >
              <div className="circle"></div>
              </button>
            </Circle> */}

            </div>
          ))}
          {selectedReport && (
            <Popup
              latitude={parseFloat(selectedReport.latitude)}
              longitude={parseFloat(selectedReport.longitude)}
              onClose={() => setSelectedReport(null)}
              closeOnClick={false}
              closeButton={true}
            >
              <div className="popup-content">
                <h3>{selectedReport.incident_address}</h3>
                <p>{new Date(selectedReport.created_date).toLocaleString('en-us', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p>{new Date(selectedReport.closed_date).toLocaleString('en-us', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p>{selectedReport.resolution_description}</p>
                <p>Issue resolved in: {howLongTillResolved()}</p>
              </div>
            </Popup>
          )}
          <ControlPanel />
        </Map>
      </div>
    </>
  );
}

export default App;
