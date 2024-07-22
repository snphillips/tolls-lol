/* eslint-disable @typescript-eslint/no-unused-vars */
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

// Note: We begin with the useFetchComplaints hook

function App() {
  const { setLoading } = useLoading();
  const { allComplaints, error } = useFetchComplaints();
  const [viewport] = useState({
    latitude: 40.69093436877119,
    longitude: -73.960938659505,
    zoom: 11,
  });
  const [cursor, setCursor] = useState<string>('auto');
  const [filteredComplaints, setFilteredComplaints] = useState<ComplaintType[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintType | null>(null);
  const [displayResolutionArray, setDisplayResolutionArray] = useState<DisplayResolutionArrayType>([
    { label: `Complaint in progress`, visibility: true },
    { label: `Summons issued`, visibility: true },
    { label: `Summons not issued`, visibility: true },
  ]);
  const [resolutionTimeInMins, setResolutionTimeInMins] = useState<number | string | undefined>();
  const [minMaxTimeInMilliseconds, setMinMaxTimeInMilliseconds] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000000000,
  });

  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);

  useEffect(() => {
    const filterData = () => {
      const visibleLabels = displayResolutionArray.filter((item) => item.visibility).map((item) => item.label);

      const visibleResolutions = resolutionLabelColorArray
        .filter((item) => visibleLabels.includes(item.label))
        .map((item) => item.resolution);

      const dataWithLatLong = allComplaints.filter((complaint) => {
        if (complaint.status === 'In Progress') {
          // In the data, complaints that are 'In progress' have resolutionDescription of undefined
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
  }, [displayResolutionArray, allComplaints]);

  useEffect(() => {
    const calculateMinMaxTime = () => {
      const timeDifferences = filteredComplaints
        .map((complaint) => complaint.timeDiffInMilliSecs)
        .filter((time) => time !== null) as number[];
      const minTime = Math.min(...timeDifferences);
      const maxTime = Math.max(...timeDifferences);
      setMinMaxTimeInMilliseconds({ min: minTime, max: maxTime });
    };
    calculateMinMaxTime();
  }, [filteredComplaints]);

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
          id: complaint.unique_key,
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

  // For development purposes
  useEffect(() => {
    if (selectedComplaint) {
      console.log('👉 selectedComplaint:', selectedComplaint);
    }
  }, [selectedComplaint]);

  const handleMouseEnter = useCallback(
    (event: MapLayerMouseEvent) => {
      const features = event.features;
      if (features && features.length > 0) {
        const hoveredFeature = features[0];
        setCursor('pointer');
        setHoveredFeatureId(hoveredFeature.id as string);
      }
    },
    [setHoveredFeatureId]
  );

  const handleMouseLeave = useCallback(() => {
    setCursor('auto');
    setHoveredFeatureId(null);
  }, []);

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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        cursor={cursor}
        interactiveLayerIds={['complaint-circles']}
      >
        <Source id="complaints" type="geojson" data={geoJsonData}>
          <Layer
            id="complaint-circles"
            type="circle"
            paint={{
              //  The ?? operator provides a default value when selectedComplaint is null or undefined.
              'circle-radius': ['case', ['==', ['get', 'unique_key'], selectedComplaint?.unique_key ?? null], 10, 5],
              'circle-opacity': ['case', ['==', ['get', 'unique_key'], selectedComplaint?.unique_key ?? null], 1, 0.6],
              'circle-stroke-width': [
                'case',
                ['==', ['get', 'unique_key'], selectedComplaint?.unique_key ?? null],
                2,
                1,
              ],
              'circle-stroke-color': 'black',
              'circle-color': [
                'case',
                ['==', ['get', 'status'], 'In Progress'],
                'orangeRed',
                [
                  '==',
                  ['get', 'resolution_description'],
                  'The Police Department issued a summons in response to the complaint.',
                ],
                'chartreuse',
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
        resolutionTimeInMins={resolutionTimeInMins}
        setResolutionTimeInMins={setResolutionTimeInMins}
        minMaxTimeInMilliseconds={minMaxTimeInMilliseconds}
      />
    </div>
  );
}

export default App;
