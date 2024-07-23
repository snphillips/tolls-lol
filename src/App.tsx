import { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Layer, Source, MapLayerMouseEvent, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Sidebar from './components/Sidebar';
import PopUp from './components/PopUp';
import './App.css';
import { ComplaintType, DisplayResolutionArrayType } from './types';
import { resolutionLabelColorArray, allOtherResolutionsArray } from './data/resolutionLabelColorArray';
import useFetchComplaints from './hooks/useFetchComplaints';

const mapStyle = 'mapbox://styles/mapbox/dark-v11?optimize=true';

function App() {
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
    { label: 'Complaint in progress', visibility: true },
    { label: 'Summons issued', visibility: true },
    { label: 'Summons not issued', visibility: true },
  ]);
  const [minTimeInMilliseconds, setMinTimeInMilliseconds] = useState<number>(0);
  const [maxTimeInMilliseconds, setMaxTimeInMilliseconds] = useState<number>(100000000);
  const [sliderResolutionTime, setSliderResolutionTime] = useState<number>(maxTimeInMilliseconds); // Start with max value

  const calculateMinMaxTime = (complaints: ComplaintType[]) => {
    const timeDifferences = complaints
      .map((complaint) => complaint.timeDiffInMilliSeconds)
      .filter((time): time is number => time !== null && time !== undefined);

    if (timeDifferences.length === 0) {
      return;
    }

    const minTime = Math.min(...timeDifferences);
    const maxTime = Math.max(...timeDifferences);
    setMinTimeInMilliseconds(minTime);
    setMaxTimeInMilliseconds(maxTime);
    // setSliderResolutionTime(maxTime); // Initialize slider value to max time
  };

  useEffect(() => {
    if (allComplaints.length > 0) {
      calculateMinMaxTime(allComplaints);
    }

    const filterData = () => {
      const visibleLabels = displayResolutionArray.filter((item) => item.visibility).map((item) => item.label);

      const visibleResolutions = resolutionLabelColorArray
        .filter((item) => visibleLabels.includes(item.label))
        .map((item) => item.resolution);

      const dataWithLatLong = allComplaints.filter((complaint) => {
        const timeDiff = complaint.timeDiffInMilliSeconds;
        const withinTimeRange =
          timeDiff !== undefined && timeDiff >= minTimeInMilliseconds && timeDiff <= sliderResolutionTime;

        if (complaint.status === 'In Progress') {
          return visibleResolutions.includes(undefined) && withinTimeRange;
        }
        if (
          complaint.resolution_description === 'The Police Department issued a summons in response to the complaint.'
        ) {
          return (
            visibleResolutions.includes('The Police Department issued a summons in response to the complaint.') &&
            withinTimeRange
          );
        } else {
          return visibleResolutions.includes(allOtherResolutionsArray) && withinTimeRange;
        }
      });

      setFilteredComplaints(dataWithLatLong);
    };
    filterData();
  }, [displayResolutionArray, allComplaints, minTimeInMilliseconds, sliderResolutionTime]);

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
      console.log('👉 minTimeInMilliseconds:', minTimeInMilliseconds);
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
        <NavigationControl />
      </Map>
      <Sidebar
        displayResolutionArray={displayResolutionArray}
        setDisplayResolutionArray={setDisplayResolutionArray}
        resolutionLabelColorArray={resolutionLabelColorArray}
        sliderResolutionTime={sliderResolutionTime}
        setSliderResolutionTime={setSliderResolutionTime}
        minTimeInMilliseconds={minTimeInMilliseconds}
        maxTimeInMilliseconds={maxTimeInMilliseconds}
      />
    </div>
  );
}

export default App;
