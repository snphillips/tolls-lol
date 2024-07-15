import { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Layer, Source, MapLayerMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ControlPanel from './components/ControlPanel';
import PopUp from './components/PopUp';
// import { determineMarkerColorUtil } from './utils/determineMarkerColorUtil';
import './App.css';
import { ComplaintType, DisplayResolutionArrayType } from './types';
import { resolutionLabelColorArray } from './data/resolutionLabelColorArray';
import useFetchComplaints from './hooks/useFetchComplaints';
import { useLoading } from './context/LoadingContext';

const mapStyle = 'mapbox://styles/mapbox/dark-v11?optimize=true';

function App() {
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

  const { setLoading } = useLoading();
  const { allComplaints, error } = useFetchComplaints();
  const [filteredComplaints, setFilteredComplaints] = useState<ComplaintType[]>([]);

  useEffect(() => {
    const filterData = () => {
      const visibleLabels = displayResolutionArray.filter((item) => item.visibility).map((item) => item.label);

      const visibleResolutions = resolutionLabelColorArray
        .filter((item) => visibleLabels.includes(item.label))
        .map((item) => item.resolution);

      const dataWithLatLong = allComplaints.filter((complaint) => {
        if (complaint.resolution_description === undefined) {
          return visibleResolutions.includes(undefined);
        }
        return visibleResolutions.includes(complaint.resolution_description);
      });

      setFilteredComplaints(dataWithLatLong);
    };
    filterData();
  }, [displayResolutionArray, allComplaints, setLoading]);

  const geoJsonData = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: filteredComplaints
        .filter(
          (complaint) =>
            complaint.latitude !== undefined &&
            complaint.longitude !== undefined &&
            complaint.latitude !== '' &&
            complaint.longitude !== ''
        )
        .map((complaint) => ({
          type: 'Feature' as const,
          properties: {
            ...complaint,
            // TODO: keep while we experiment with coloring via circle-color
            // color: determineMarkerColorUtil(complaint.resolution_description as string, resolutionLabelColorArray),
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [parseFloat(complaint.longitude!), parseFloat(complaint.latitude!)],
          },
        })),
    };
  }, [filteredComplaints]);

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const features = event.features;
      console.log('event', event);
      console.log('event', event);
      if (features && features.length > 0) {
        const clickedFeature = features[0];
        setSelectedComplaint(clickedFeature.properties as ComplaintType);
      } else {
        setSelectedComplaint(null);
      }
    },
    [setSelectedComplaint]
  );

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div id="map">
      <Map
        mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN}
        initialViewState={viewport}
        mapStyle={mapStyle}
        onClick={handleMapClick}
      >
        <Source id="complaints" type="geojson" data={geoJsonData}>
          <Layer
            id="complaint-points"
            type="circle"
            paint={{
              'circle-radius': 5,
              // TODO: keep for now while we experiment with other ways to get color
              // 'circle-color': ['get', 'color'],
              'circle-opacity': 0.7,
              'circle-color': [
                'match',
                ['get', 'resolution_description'],
                `The Police Department issued a summons in response to the complaint.`,
                `chartreuse`,
                // `The Police Department responded and upon arrival those responsible for the condition were gone.`,
                // `lightSeaGreen`,
                // `The Police Department responded to the complaint and a report was prepared.`,
                // `purple`,
                // `The Police Department responded to the complaint and determined that police action was not necessary.`,
                // `royalBlue`,
                // `The Police Department responded to the complaint and took action to fix the condition.`,
                // `pink`,
                // `The Police Department responded to the complaint and with the information available observed no evidence of the violation at that time.`,
                // `orange`,
                // `The Police Department responded to the complaint but officers were unable to gain entry into the premises.`,
                // `red`,
                // `The Police Department reviewed your complaint and provided additional information below.`,
                // `tan`,
                // `This complaint does not fall under the Police Department's jurisdiction.`,
                // `powderBlue`,
                // `Your request can not be processed at this time because of insufficient contact information. Please create a new Service Request on NYC.gov and provide more detailed contact information.`,
                // `yellow`,
                // Default color below
                'mediumOrchid',
              ],
            }}
          />
        </Source>

        {selectedComplaint && selectedComplaint.latitude && selectedComplaint.longitude && (
          <PopUp selectedComplaint={selectedComplaint} setSelectedComplaint={setSelectedComplaint} />
        )}

        <ControlPanel
          displayResolutionArray={displayResolutionArray}
          setDisplayResolutionArray={setDisplayResolutionArray}
          resolutionLabelColorArray={resolutionLabelColorArray}
        />
      </Map>
    </div>
  );
}

export default App;
