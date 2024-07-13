import { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ControlPanel from './ControlPanel';
import PopUp from './PopUp';
import { determineMarkerColor } from './helper-functions';
import './App.css';
import { ComplaintType, DisplayResolutionArrayType } from './types';
import { resolutionDescLabelColorArray } from './resolutionDescLabelColorArray';
import useFetchComplaints from './useFetchComplaints';

const mapStyle = 'mapbox://styles/mapbox/dark-v11';

function App() {
  // const { loading } = useLoading();
  const [viewport] = useState({
    latitude: 40.69093436877119,
    longitude: -73.960938659505,
    zoom: 11,
  });
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintType | null>(null);
  const [displayResolutionArray, setDisplayResolutionArray] = useState<DisplayResolutionArrayType>([
    { label: `Complaint still open`, visibility: true },
    { label: `Summons issued`, visibility: true },
    { label: `Took action to fix the condition`, visibility: true },
    { label: `A report was prepared`, visibility: true },
    { label: `No evidence of the violation`, visibility: true },
    { label: `Not NYPD's jurisdiction`, visibility: true },
    { label: `Determined that action was not necessary`, visibility: true },
    { label: `Upon arrival those responsible were gone`, visibility: true },
    { label: 'Provided additional information below', visibility: true },
    { label: 'Officers unable to gain entry to premises', visibility: true },
    { label: `No action. Insufficient contact information`, visibility: true },
  ]);

  const { allComplaints, error } = useFetchComplaints();
  const [filteredComplaints, setFilteredComplaints] = useState<ComplaintType[]>([]);

  useEffect(() => {
    const visibleLabels = displayResolutionArray.filter((item) => item.visibility).map((item) => item.label);

    const visibleResolutions = resolutionDescLabelColorArray
      .filter((item) => visibleLabels.includes(item.label))
      .map((item) => item.resolution);

    const dataWithLatLong = allComplaints.filter((complaint) => {
      if (complaint.resolution_description === undefined) {
        return visibleResolutions.includes(undefined);
      }
      return visibleResolutions.includes(complaint.resolution_description);
    });

    setFilteredComplaints(dataWithLatLong);
  }, [displayResolutionArray, allComplaints]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
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
                  setSelectedComplaint(complaint);
                }}
              >
                <div
                  style={{
                    backgroundColor: determineMarkerColor(
                      complaint.resolution_description as string,
                      resolutionDescLabelColorArray
                    ),
                  }}
                  className="marker"
                />
              </button>
            </Marker>
          ) : null
        )}
        {selectedComplaint && selectedComplaint.latitude && selectedComplaint.longitude && (
          <PopUp selectedComplaint={selectedComplaint} setSelectedComplaint={setSelectedComplaint} />
        )}
        <ControlPanel
          displayResolutionArray={displayResolutionArray}
          setDisplayResolutionArray={setDisplayResolutionArray}
          resolutionDescLabelColorArray={resolutionDescLabelColorArray}
        />
      </Map>
    </div>
  );
}

export default App;
