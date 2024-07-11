/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// import pluralize from 'pluralize';
import ControlPanel from './ControlPanel';
import { howLongTillComplaintResolved } from './helper-functions';
import './App.css';
import { ComplaintType, DisplayResolutionArrayType, ResolutionDescriptionType } from './types';
import { resolutionDescriptionsArray } from './ResolutionDescriptionsArray';

const dataURL = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

// const mapStyle = 'mapbox://styles/mapbox/streets-v12';
const mapStyle = 'mapbox://styles/mapbox/dark-v11';

function App() {
  const [viewport] = useState({
    latitude: 40.69093436877119,
    longitude: -73.960938659505,
    zoom: 11,
  });

  // 40.69211842795016, -73.960938659505
  const [markersByResolution, setMarkersByResolution] = useState({});
  const [allComplaints, setAllComplaints] = useState<ComplaintType[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<ComplaintType[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintType | null>(null);
  const [displayResolutionArray, setDisplayResolutionArray] = useState<DisplayResolutionArrayType>([
    {
      label: `Complaint still open`,
      color: `#FFE74C`,
      visibility: true,
    },
    {
      label: `Summons issued`,
      color: `green`, // green
      visibility: true,
    },
    {
      label: `Took action to fix the condition`,
      color: `#faa2f7`, // pink
      visibility: true,
    },
    {
      label: `A report was prepared`,
      color: `purple`, // purple
      visibility: true,
    },
    {
      label: `No evidence of the violation`,
      color: `orange`, // orange
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
      visibility: true,
    },
    {
      label: 'Officers unable to gain entry to premises',
      color: `red`, // red
      visibility: true,
    },
    {
      label: `No action. Insufficient contact information`,
      color: `yellow`, // yellow
      visibility: true,
    },
  ]);

  // const howLongTillComplaintResolved = (): string | null => {
  //   // Return null if no complaint is selected
  //   if (!selectedComplaint) return null;

  //   // Parse the creation and closure dates of the complaint
  //   const createdDate = new Date(selectedComplaint.created_date);
  //   if (!selectedComplaint.closed_date) return 'Complaint is still open';
  //   const closedDate = new Date(selectedComplaint.closed_date);

  //   // Calculate the time difference between creation and closure in milliseconds
  //   const diffTime = closedDate.getTime() - createdDate.getTime();

  //   // Calculate the difference in days, hours, and minutes
  //   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //   const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  //   const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  //   // If the issue is resolved in less than 1 hour, display only the minutes
  //   if (diffDays === 0 && diffHours === 0) {
  //     return `Issue resolved in: ${diffMinutes} ${pluralize('minute', diffMinutes)}`;
  //   }

  //   // Otherwise, display the days, hours, and minutes
  //   return `Issue resolved in: ${diffDays > 0 ? `${diffDays} ${pluralize('day', diffDays)}, ` : ''}${diffHours} ${pluralize(
  //     'hour',
  //     diffHours
  //   )}, and ${diffMinutes} ${pluralize('minute', diffMinutes)}`;
  // };

  // howLongTillComplaintResolved();

  const determineMarkerColor = (resolutionDescription: string): string => {
    const resolution = resolutionDescriptionsArray.find((res) => res.resolution === resolutionDescription);
    return resolution ? resolution.color : 'white'; // Default to white if no match is found
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching new data from the API');
      let allData: ComplaintType[] = [];
      let offset = 0;
      const limit = 1000;
      let totalFetched;

      try {
        do {
          const query = `
            SELECT
              unique_key, created_date, closed_date,
              incident_address, status, resolution_description,
              latitude, longitude
            WHERE
              caseless_one_of(complaint_type, 'Illegal Parking') AND
              caseless_one_of(descriptor, 'License Plate Obscured') AND
              created_date > '2024-01-01T00:00:00' :: floating_timestamp
            ORDER BY created_date DESC NULL FIRST
            LIMIT ${limit} OFFSET ${offset}
          `;
          const encodedQuery = encodeURIComponent(query);
          const url = `${dataURL}?$query=${encodedQuery}`;
          console.log(`Fetching URL: ${url}`);

          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
          }

          const data = await response.json();

          if (!Array.isArray(data)) {
            throw new Error('Data is not an array');
          }

          allData = [...allData, ...data];
          totalFetched = data.length;
          offset += totalFetched;
        } while (totalFetched === limit);

        // what's going on here?
        const filteredData = allData.filter((item: ComplaintType) => item.latitude && item.longitude);

        // Categorize markers by resolution type, place into arrays
        const categorizedMarkers = filteredData.reduce((accumulator, marker) => {
          const resolutionType = marker.resolution_description;
          if (resolutionType) {
            if (!accumulator[resolutionType]) {
              accumulator[resolutionType] = [];
            }
            accumulator[resolutionType].push(marker);
          }
          return accumulator;
        }, {} as Record<string, ComplaintType[]>);
        console.log('HI! categorizedMarkers', categorizedMarkers);

        // note: change this? why setting both setComplaints & setFiltredComplaints?
        setAllComplaints(filteredData);
        setFilteredComplaints(filteredData);

        // Store categorized markers for further use
        // setMarkersByResolution(categorizedMarkers);

        // Store the fetched data and the current timestamp in localStorage
        localStorage.setItem('complaints', JSON.stringify(filteredData));
        localStorage.setItem('lastFetch', new Date().toISOString());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Directly call fetchData to always retrieve fresh data during development
    fetchData();

    // ==============================================================
    // The code below might be commented out for development purposes
    // ==============================================================

    // Retrieve the last fetch timestamp from localStorage
    const lastFetch = localStorage.getItem('lastFetch');
    const now = new Date().toISOString();

    // Check if the last fetch timestamp is older than 12 hours OR if lastFetch doesn't exist
    // if (!lastFetch || new Date(now).getTime() - new Date(lastFetch).getTime() > 12 * 60 * 60 * 1000) {
    if (!lastFetch || new Date(now).getTime() - new Date(lastFetch).getTime() > 0.0001 * 60 * 60 * 1000) {
      console.log('No cached data found or cached data is older than 12 hours');
      fetchData();
    } else {
      // Retrieve the cached data from localStorage
      const cachedData = localStorage.getItem('complaints');
      if (cachedData) {
        console.log(Date(), 'Data is less than 12hrs old. Using cached data');
        const parsedData = JSON.parse(cachedData);
        setAllComplaints(parsedData);
        setFilteredComplaints(parsedData);
      } else {
        console.log('Cached data not found, fetching new data');
        fetchData();
      }
    }
  }, []);

  useEffect(() => {
    const visibleLabels = displayResolutionArray.filter((item) => item.visibility).map((item) => item.label);

    const visibleResolutions = resolutionDescriptionsArray
      .filter((item) => visibleLabels.includes(item.label))
      .map((item) => item.resolution);

    const filteredData = allComplaints.filter((complaint) => {
      if (complaint.resolution_description === undefined) {
        // Check if undefined (which corresponds to 'No resolution') is in the visibleResolutions
        return visibleResolutions.includes(undefined);
      }
      return visibleResolutions.includes(complaint.resolution_description);
    });

    setFilteredComplaints(filteredData);
  }, [displayResolutionArray, allComplaints]);

  return (
    <>
      <div id="map">
        <Map mapboxAccessToken={import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN} initialViewState={viewport} mapStyle={mapStyle}>
          {filteredComplaints.map((complaint) =>
            complaint.latitude && complaint.longitude ? (
              <Marker key={complaint.unique_key} latitude={parseFloat(complaint.latitude)} longitude={parseFloat(complaint.longitude)}>
                <button
                  className="marker-btn"
                  onClick={(event) => {
                    event.preventDefault();
                    console.log('clicked', complaint.incident_address, complaint.resolution_description);
                    setSelectedComplaint(complaint);
                  }}
                >
                  <div
                    style={{
                      backgroundColor: determineMarkerColor(complaint.resolution_description as string),
                    }}
                    className="marker"
                  ></div>
                </button>
              </Marker>
            ) : null
          )}
          {selectedComplaint && selectedComplaint.latitude && selectedComplaint.longitude && (
            <Popup
              latitude={parseFloat(selectedComplaint.latitude)}
              longitude={parseFloat(selectedComplaint.longitude)}
              onClose={() => setSelectedComplaint(null)}
              closeOnClick={false}
              closeButton={true}
            >
              <div className="popup-container">
                {/* temporary while in dev */}
                <p>temp while in dev: {selectedComplaint.unique_key}</p>
                <h3 id="incident_address">
                  {selectedComplaint.incident_address.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())}
                </h3>
                <h4>Complaint opened:</h4>
                <p className="popup-content">
                  {new Date(selectedComplaint.created_date).toLocaleString('en-us', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <h4>Complaint closed:</h4>
                <p className="popup-content">
                  {selectedComplaint.closed_date
                    ? new Date(selectedComplaint.closed_date).toLocaleString('en-us', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Complaint is still open'}
                </p>
                <h4>Complaint Resolution:</h4>
                <p className="popup-content">{selectedComplaint.resolution_description}</p>
                <p>{selectedComplaint.closed_date ? howLongTillComplaintResolved(selectedComplaint) : ''}</p>
              </div>
            </Popup>
          )}
          <ControlPanel displayResolutionArray={displayResolutionArray} setDisplayResolutionArray={setDisplayResolutionArray} />
        </Map>
      </div>
    </>
  );
}

export default App;
