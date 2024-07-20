import { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Layer, Source, MapLayerMouseEvent, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Sidebar from './components/Sidebar';
import PopUp from './components/PopUp';
import './App.css';
import { ComplaintType, DisplayResolutionArrayType } from './types';
import { resolutionLabelColorArray, allOtherResolutionsArray } from './data/resolutionLabelColorArray';
import useFetchComplaints from './hooks/useFetchComplaints';
import { useLoading } from './context/LoadingContext';

const mapStyle = 'mapbox://styles/mapbox/dark-v11?optimize=true';

function App() {
  const [viewport] = useState({
    latitude: 40.69093436877119,
    longitude: -73.960938659505,
    zoom: 11,
  });
  const [cursor, setCursor] = useState<string>('auto');
  const [resolutionTime, setResolutionTime] = useState<number | string | undefined>();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintType | null>(null);
  const [displayResolutionArray, setDisplayResolutionArray] = useState<DisplayResolutionArrayType>([
    { label: `Complaint still in progress`, visibility: true },
    { label: `Summons issued`, visibility: true },
    { label: `Summons not issued`, visibility: true },
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
        if (complaint.status === 'In Progress') {
          // Complaints that are still in progress have resolutionDescription of undefined
          return visibleResolutions.includes(undefined);
        }
        if (
          complaint.resolution_description === `The Police Department issued a summons in response to the complaint.`
        ) {
          return visibleResolutions.includes(`The Police Department issued a summons in response to the complaint.`);
        } else {
          return visibleResolutions.includes(allOtherResolutionsArray);
        }
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
          properties: { ...complaint },
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
      if (features && features.length > 0) {
        const clickedFeature = features[0];
        setSelectedComplaint(clickedFeature.properties as ComplaintType);
      } else {
        setSelectedComplaint(null);
      }
    },
    [setSelectedComplaint]
  );

  const onMouseEnter = useCallback(() => setCursor('pointer'), []);
  const onMouseLeave = useCallback(() => setCursor('auto'), []);

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
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        cursor={cursor}
        interactiveLayerIds={['complaint-circles']}
      >
        <Source id="complaints" type="geojson" data={geoJsonData}>
          <Layer
            id="complaint-circles"
            type="circle"
            paint={{
              'circle-radius': 5,
              'circle-opacity': 0.8,
              'circle-stroke-width': 1,
              'circle-stroke-color': 'black',
              'circle-color': [
                'case',
                [
                  '==',
                  ['get', 'resolution_description'],
                  `The Police Department issued a summons in response to the complaint.`,
                ],
                `chartreuse`,
                ['==', ['get', 'status'], `In Progress`],
                'orangeRed',
                'mediumPurple', // Default color
              ],
            }}
          />
        </Source>

        {selectedComplaint && selectedComplaint.latitude && selectedComplaint.longitude && (
          <PopUp selectedComplaint={selectedComplaint} setSelectedComplaint={setSelectedComplaint} />
        )}
        <NavigationControl />
      </Map>
      <Sidebar
        displayResolutionArray={displayResolutionArray}
        setDisplayResolutionArray={setDisplayResolutionArray}
        resolutionLabelColorArray={resolutionLabelColorArray}
        resolutionTime={resolutionTime}
        setResolutionTime={setResolutionTime}
      />
    </div>
  );
}

export default App;
