// React hooks used throughout this component:
// - useState: stores values that cause re-renders when changed
// - useEffect: runs side effects (like filtering data) after renders
// - useMemo: caches expensive computed values so they're only recalculated when dependencies change
// - useCallback: caches functions so they aren't recreated on every render (good for event handlers)
import { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Layer, Source, MapLayerMouseEvent, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Sidebar from './components/Sidebar';
import PopUp from './components/PopUp';
import './App.css';
import './components/PopUp.css';
import { ComplaintType, DisplayResolutionArrayType, ResolutionLabelType } from './types';
import { resolutionLabelColorArray, allOtherResolutionsArray } from './data/resolutionLabelColorArray';
import useFetchComplaints from './hooks/useFetchComplaints';

// The Mapbox style URL for a dark-themed map. The `?optimize=true` flag improves load performance.
const mapStyle = 'mapbox://styles/mapbox/dark-v11?optimize=true';

const App = () => {
  // Custom hook that fetches all complaint data from the S3 bucket.
  // Returns the full list of complaints and any fetch error message.
  const { allComplaints, error } = useFetchComplaints();

  // Sets the initial map position when the page loads (centered over Brooklyn/NYC).
  // The `zoom` value controls how zoomed in the map starts (higher = more zoomed in).
  // No setter function is destructured here because the viewport never changes.
  const [viewport] = useState({
    latitude: 40.69093436877119,
    longitude: -73.960938659505,
    zoom: 11,
  });

  // Controls the mouse cursor style. Changes to 'pointer' when hovering over a complaint dot.
  const [cursor, setCursor] = useState<string>('auto');

  // The subset of allComplaints that passes the current filter settings (checkboxes + time slider).
  // This is what actually gets rendered as dots on the map.
  const [filteredComplaints, setFilteredComplaints] = useState<ComplaintType[]>([]);

  // The complaint the user most recently clicked on. Drives the PopUp display.
  // Null means no popup is shown.
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintType | null>(null);

  // Tracks which resolution categories are checked in the sidebar and how many complaints
  // fall into each category. All three start visible (visibility: true).
  const [displayResolutionArray, setDisplayResolutionArray] = useState<DisplayResolutionArrayType>([
    { label: 'Complaint in progress', visibility: true, count: 0, percent: 0 },
    { label: 'Summons issued', visibility: true, count: 0, percent: 0 },
    { label: 'Summons not issued', visibility: true, count: 0, percent: 0 },
  ]);

  // The minimum time value for the resolution-time range slider (0 ms = 0 hours).
  // No setter — this value never changes.
  const [minRangeTime] = useState<number>(0);

  // The maximum time value for the range slider (43,200,000 ms = 12 hours).
  // Complaints that took longer than 12 hours are included when the slider is at this max.
  // No setter — this value never changes.
  const [maxAndUpRangeTime] = useState<number>(43200000); // 12 hrs

  // A two-element array representing the current [min, max] positions of the range slider.
  // Starts at [0, 12hrs], meaning all complaints are shown by default.
  const [rangeSliderResolutionTime, setRangeSliderResolutionTime] = useState<number[]>([
    minRangeTime,
    maxAndUpRangeTime,
  ]);

  // Re-runs the filtering logic whenever the user changes checkboxes, the slider,
  // or when the complaint data first loads.
  useEffect(() => {
    const filterBasedOnVisibilityAndTimeRange = () => {
      // Step 1: Get the labels the user has checked (e.g. ['Summons issued', 'Complaint in progress'])
      const userSetVisibleLabels = displayResolutionArray
        .filter((item) => item.visibility)
        .map((item) => item.label as ResolutionLabelType);

      // Step 2: Translate those labels into the actual resolution description strings stored
      // on each complaint. `flatMap` is used because one label (e.g. "Summons not issued")
      // maps to multiple resolution descriptions.
      const visibleResolutions = resolutionLabelColorArray
        .filter((item) => userSetVisibleLabels.includes(item.label as ResolutionLabelType))
        .flatMap((item) => item.resolution) // flattens nested arrays
        .filter((res) => res !== undefined); // Remove undefined values (e.g. "In Progress" has no resolution)

      // Step 3: Filter the full complaint list down to only those that should be shown on the map.
      const dataWithLatLong = allComplaints.filter((complaint) => {
        const timeDiff = complaint.timeDiffInMilliseconds;
        const lowestTimeOnSlider = rangeSliderResolutionTime[0];
        const highestTimeOnSlider = rangeSliderResolutionTime[1];

        // A complaint is "within the time range" if its resolution time falls between
        // the slider's current min and max values.
        // Special case: if the slider is at its maximum (12hrs), also include complaints
        // that took even longer than 12 hours (the "12+" bucket).
        const withinTimeRange =
          timeDiff !== undefined &&
          timeDiff !== null &&
          timeDiff >= lowestTimeOnSlider &&
          (highestTimeOnSlider === maxAndUpRangeTime || timeDiff <= highestTimeOnSlider);

        // "In Progress" complaints have no closed date or time diff, so we skip the
        // time range check and just show them if their checkbox is checked.
        if (complaint.status === 'In Progress' && userSetVisibleLabels.includes('Complaint in progress')) {
          return true;
        }

        // "Summons issued" is a single specific resolution description.
        // Show it only if it's checked AND it falls within the selected time range.
        if (
          complaint.resolution_description === 'The Police Department issued a summons in response to the complaint.' &&
          visibleResolutions.includes(complaint.resolution_description) &&
          withinTimeRange
        ) {
          return true;
        }

        // All other closed complaints ("Summons not issued") map to several possible
        // resolution descriptions, all stored in `allOtherResolutionsArray`.
        // Show them only if the description is in that array, within the time range,
        // and the "Summons not issued" checkbox is checked.
        if (
          complaint.resolution_description &&
          allOtherResolutionsArray.includes(complaint.resolution_description) &&
          withinTimeRange
        ) {
          return visibleResolutions.includes(complaint.resolution_description);
        }

        // If none of the above conditions matched, don't show this complaint.
        return false;
      });

      setFilteredComplaints(dataWithLatLong);
    };

    filterBasedOnVisibilityAndTimeRange();
  }, [displayResolutionArray, allComplaints, rangeSliderResolutionTime, maxAndUpRangeTime]);
  // ^ These are the dependencies — the effect re-runs whenever any of these values change.

  // Converts `filteredComplaints` into GeoJSON format, which is what Mapbox expects
  // for rendering data on the map.
  // `useMemo` prevents this from being recalculated on every render — it only runs
  // when `filteredComplaints` changes.
  const geoJsonData = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: filteredComplaints
        // Skip any complaints that are missing coordinates — they can't be placed on a map.
        .filter(
          (complaint) =>
            complaint.latitude !== undefined &&
            complaint.longitude !== undefined &&
            complaint.latitude !== '' &&
            complaint.longitude !== ''
        )
        // Shape each complaint into a GeoJSON "Feature" object.
        // Mapbox uses longitude first, then latitude (the opposite of what you might expect).
        .map((complaint) => ({
          type: 'Feature' as const,
          properties: { ...complaint }, // All complaint fields are accessible in map event handlers
          geometry: {
            type: 'Point' as const,
            coordinates: [parseFloat(complaint.longitude!), parseFloat(complaint.latitude!)],
          },
          id: complaint.unique_key, // Unique ID lets Mapbox identify individual features
        })),
    };
  }, [filteredComplaints]);

  // Fires when the user clicks anywhere on the map.
  // If they clicked on a complaint dot, set it as selected (shows the PopUp).
  // If they clicked on empty space, deselect (closes the PopUp).
  // `useCallback` prevents this function from being recreated on every render,
  // which would unnecessarily re-render child components that receive it as a prop.
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

  // Changes the cursor to a hand/pointer when the mouse moves over a complaint dot.
  const handleMouseEnter = useCallback((event: MapLayerMouseEvent) => {
    const features = event.features;
    if (features && features.length > 0) {
      setCursor('pointer');
    }
  }, []);

  // Resets the cursor back to the default arrow when the mouse leaves a complaint dot.
  const handleMouseLeave = useCallback(() => {
    setCursor('auto');
  }, []);

  // If the data fetch failed, show a simple error message instead of the map.
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div id="site">
      {/* The Mapbox map. `interactiveLayerIds` tells Mapbox which layer should
          trigger mouse events — only the 'complaint-circles' layer is clickable. */}
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
        {/* Source provides the GeoJSON data to Mapbox.
            Layer defines how that data is visually rendered (as circles here). */}
        <Source id="complaints" type="geojson" data={geoJsonData}>
          <Layer
            id="complaint-circles"
            type="circle"
            paint={{
              // Selected complaint dot is larger (radius 10) than unselected dots (radius 5).
              // The Mapbox expression ['case', condition, valueIfTrue, valueIfFalse] works like a ternary.
              'circle-radius': ['case', ['==', ['get', 'unique_key'], selectedComplaint?.unique_key ?? null], 10, 5],

              // Selected dot is fully opaque; others are slightly transparent.
              'circle-opacity': ['case', ['==', ['get', 'unique_key'], selectedComplaint?.unique_key ?? null], 1, 0.7],

              // Selected dot has a thicker border (stroke-width 2) than others (1).
              'circle-stroke-width': [
                'case',
                ['==', ['get', 'unique_key'], selectedComplaint?.unique_key ?? null],
                2,
                1,
              ],

              'circle-stroke-color': 'black',

              // Dot color is determined by the complaint's status/resolution:
              // - orangeRed  → complaint is still in progress
              // - chartreuse → a summons was issued
              // - mediumPurple → all other closed resolutions
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
                'mediumPurple', // default/fallback color
              ],
            }}
          />
        </Source>

        {/* Only render the PopUp when a complaint is selected and has valid coordinates. */}
        {selectedComplaint && selectedComplaint.latitude && selectedComplaint.longitude && (
          <PopUp selectedComplaint={selectedComplaint} setSelectedComplaint={setSelectedComplaint} />
        )}

        {/* Built-in Mapbox zoom in/out and compass controls, placed in the top-left corner. */}
        <NavigationControl position="top-left" />
      </Map>

      {/* The sidebar holds the filter checkboxes and the resolution time range slider.
          State and setters are passed down as props so the sidebar can update the map. */}
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
