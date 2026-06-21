import { useState, useMemo, useCallback } from 'react';
import Map, { Layer, Source, MapLayerMouseEvent, NavigationControl } from 'react-map-gl';
import Sidebar from './components/Sidebar';
import PopUp from './components/PopUp';
import './App.css';
import './components/PopUp.css';
import { ComplaintType, DisplayResolutionArrayType, ResolutionLabelType } from './types';
import { resolutionLabelColorArray, allOtherResolutionsArray } from './data/resolutionLabelColorArray';
import useFetchComplaints from './hooks/useFetchComplaints';

// Constants
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11?optimize=true';
const MIN_RANGE_TIME = 0;
const MAX_AND_UP_RANGE_TIME = 43200000; // 12 hrs
const INITIAL_VIEW_STATE = {
  latitude: 40.69093436877119,
  longitude: -73.960938659505,
  zoom: 11,
};

const SUMMONS_ISSUED_DESCRIPTION = 'The Police Department issued a summons in response to the complaint.';

const App = () => {
  const { allComplaints, error } = useFetchComplaints();
  const [cursor, setCursor] = useState<string>('auto');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintType | null>(null);
  const [displayResolutionArray, setDisplayResolutionArray] = useState<DisplayResolutionArrayType>([
    { label: 'Complaint in progress', visibility: true, count: 0, percent: 0 },
    { label: 'Summons issued', visibility: true, count: 0, percent: 0 },
    { label: 'Summons not issued', visibility: true, count: 0, percent: 0 },
  ]);
  const [rangeSliderResolutionTime, setRangeSliderResolutionTime] = useState<number[]>([
    MIN_RANGE_TIME,
    MAX_AND_UP_RANGE_TIME,
  ]);

  const filteredComplaints = useMemo(() => {
    const userSetVisibleLabels = displayResolutionArray
      .filter((item) => item.visibility)
      .map((item) => item.label as ResolutionLabelType);

    const visibleResolutions = resolutionLabelColorArray
      .filter((item) => userSetVisibleLabels.includes(item.label as ResolutionLabelType))
      .flatMap((item) => item.resolution)
      .filter((res) => res !== undefined);

    const [lowestTimeOnSlider, highestTimeOnSlider] = rangeSliderResolutionTime;

    return allComplaints.filter((complaint) => {
      if (!complaint.latitude || !complaint.longitude) return false;

      const timeDiff = complaint.timeDiffInMilliseconds;
      const withinTimeRange =
        timeDiff !== undefined &&
        timeDiff !== null &&
        timeDiff >= lowestTimeOnSlider &&
        (highestTimeOnSlider === MAX_AND_UP_RANGE_TIME || timeDiff <= highestTimeOnSlider);

      // Complaints in progress have no time range to check
      if (complaint.status === 'In Progress') {
        return userSetVisibleLabels.includes('Complaint in progress');
      }

      // Summons issued
      if (complaint.resolution_description === SUMMONS_ISSUED_DESCRIPTION) {
        return visibleResolutions.includes(complaint.resolution_description) && withinTimeRange;
      }

      // All other resolutions
      if (complaint.resolution_description && allOtherResolutionsArray.includes(complaint.resolution_description)) {
        return visibleResolutions.includes(complaint.resolution_description) && withinTimeRange;
      }

      return false;
    });
  }, [allComplaints, displayResolutionArray, rangeSliderResolutionTime]);

  // Coordinates are already guaranteed by the filter above, so no need to re-check here
  const geoJsonData = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: filteredComplaints.map((complaint) => ({
        type: 'Feature' as const,
        properties: { ...complaint },
        geometry: {
          type: 'Point' as const,
          coordinates: [parseFloat(complaint.longitude!), parseFloat(complaint.latitude!)],
        },
        id: complaint.unique_key,
      })),
    }),
    [filteredComplaints]
  );

  // setSelectedComplaint is stable (guaranteed by React), so omitted from deps
  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    const features = event.features;
    if (features && features.length > 0) {
      setSelectedComplaint(features[0].properties as ComplaintType);
    } else {
      setSelectedComplaint(null);
    }
  }, []);

  const handleMouseEnter = useCallback((event: MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) {
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
      <Map
        id="map"
        mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN}
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={MAP_STYLE}
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
                ['==', ['get', 'resolution_description'], SUMMONS_ISSUED_DESCRIPTION],
                'chartreuse',
                'mediumPurple',
              ],
            }}
          />
        </Source>
        {/* PopUp handles its own lat/lon guard internally */}
        {selectedComplaint && (
          <PopUp selectedComplaint={selectedComplaint} setSelectedComplaint={setSelectedComplaint} />
        )}
        <NavigationControl position="top-left" />
      </Map>
      <Sidebar
        displayResolutionArray={displayResolutionArray}
        setDisplayResolutionArray={setDisplayResolutionArray}
        resolutionLabelColorArray={resolutionLabelColorArray}
        minRangeTime={MIN_RANGE_TIME}
        maxAndUpRangeTime={MAX_AND_UP_RANGE_TIME}
        rangeSliderResolutionTime={rangeSliderResolutionTime}
        setRangeSliderResolutionTime={setRangeSliderResolutionTime}
      />
    </div>
  );
};

export default App;
