import { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Layer, Source, MapLayerMouseEvent, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Sidebar from './components/Sidebar';
import PopUp from './components/PopUp';
import './App.css';
import './components/PopUp.css';
import { ComplaintType, DisplayResolutionArrayType, ResolutionLabelType } from './types';
// import { resolutionLabelColorArray, allOtherResolutionsArray } from './data/resolutionLabelColorArray';
import { resolutionLabelColorArray } from './data/resolutionLabelColorArray';
import useFetchComplaints from './hooks/useFetchComplaints';

const mapStyle = 'mapbox://styles/mapbox/dark-v11?optimize=true';

const App = () => {
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
    { label: 'Complaint in progress', visibility: true, count: 0, percent: 0 },
    { label: 'Summons issued', visibility: true, count: 0, percent: 0 },
    { label: 'Summons not issued', visibility: true, count: 0, percent: 0 },
  ]);
  const [minRangeTime] = useState<number>(0);
  const [maxAndUpRangeTime] = useState<number>(43200000); // 12 hrs
  const [rangeSliderResolutionTime, setRangeSliderResolutionTime] = useState<number[]>([
    minRangeTime,
    maxAndUpRangeTime,
  ]);

  useEffect(() => {
    console.log('filteredComplaints', filteredComplaints);
    const filterBasedOnVisibilityAndTimeRange = () => {
      const userSetVisibleLabels = displayResolutionArray
        .filter((item) => item.visibility)
        .map((item) => item.label as ResolutionLabelType);

      // Map visible labels to their corresponding resolution descriptions
      const visibleResolutions = resolutionLabelColorArray
        .filter((item) => userSetVisibleLabels.includes(item.label as ResolutionLabelType))
        .map((item) => item.resolution);

      const dataWithLatLong = allComplaints.filter((complaint) => {
        const timeDiff = complaint.timeDiffInMilliseconds;
        const lowestTimeOnSlider = rangeSliderResolutionTime[0];
        const highestTimeOnSlider = rangeSliderResolutionTime[1];
        const withinTimeRange =
          timeDiff !== undefined &&
          timeDiff !== null &&
          timeDiff >= lowestTimeOnSlider &&
          (highestTimeOnSlider === maxAndUpRangeTime || timeDiff <= highestTimeOnSlider);
        // Filter based on `status` and `resolution_description`
        if (complaint.status === 'In Progress' && userSetVisibleLabels.includes('Complaint in progress')) {
          return true;
        }

        if (
          complaint.resolution_description === 'The Police Department issued a summons in response to the complaint.' &&
          visibleResolutions.includes(complaint.resolution_description) &&
          withinTimeRange
        ) {
          return true;
        }

        // Handle other complaints based on `visibleResolutions`
        return (
          complaint.resolution_description &&
          visibleResolutions.includes(complaint.resolution_description) &&
          withinTimeRange
        );
      });

      // Update state with filtered complaints
      setFilteredComplaints(dataWithLatLong);
    };

    filterBasedOnVisibilityAndTimeRange();
  }, [displayResolutionArray, allComplaints, rangeSliderResolutionTime, maxAndUpRangeTime]);

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

  useEffect(() => {
    if (selectedComplaint) {
      console.log('👉 selectedComplaint:', selectedComplaint);
      console.log('👉 selectedComplaint.timeDiffInMilliseconds:', selectedComplaint.timeDiffInMilliseconds);
    }
  }, [selectedComplaint]);

  const handleMouseEnter = useCallback((event: MapLayerMouseEvent) => {
    const features = event.features;
    if (features && features.length > 0) {
      setCursor('pointer');
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursor('auto');
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div id="site">
      {/* <LoadingSpinner /> */}
      <Map
        id="map"
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
              'circle-radius': ['case', ['==', ['get', 'unique_key'], selectedComplaint?.unique_key ?? null], 10, 5],
              'circle-opacity': ['case', ['==', ['get', 'unique_key'], selectedComplaint?.unique_key ?? null], 1, 0.7],
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
                'mediumPurple',
              ],
            }}
          />
        </Source>

        {selectedComplaint && selectedComplaint.latitude && selectedComplaint.longitude && (
          <PopUp selectedComplaint={selectedComplaint} setSelectedComplaint={setSelectedComplaint} />
        )}
        <NavigationControl position="top-left" />
      </Map>
      <Sidebar
        displayResolutionArray={displayResolutionArray}
        setDisplayResolutionArray={setDisplayResolutionArray}
        resolutionLabelColorArray={resolutionLabelColorArray}
        minRangeTime={minRangeTime}
        maxAndUpRangeTime={maxAndUpRangeTime}
        rangeSliderResolutionTime={rangeSliderResolutionTime}
        setRangeSliderResolutionTime={setRangeSliderResolutionTime}
      />
    </div>
  );
};

export default App;
