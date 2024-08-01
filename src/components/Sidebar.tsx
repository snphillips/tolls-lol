/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import logo from '../assets/tolls-lol.png';
import './Sidebar.css';
import LoadingSpinner from './LoadingSpinner';
import {
  DisplayResolutionArrayType,
  setDisplayResolutionArrayType,
  resolutionLabelColorArrayType,
  setRangeSliderResolutionTimeType,
} from '../types';

type Props = {
  displayResolutionArray: DisplayResolutionArrayType;
  setDisplayResolutionArray: setDisplayResolutionArrayType;
  resolutionLabelColorArray: resolutionLabelColorArrayType;
  rangeSliderResolutionTime: number[];
  setRangeSliderResolutionTime: setRangeSliderResolutionTimeType;
  minRangeTime: number;
  maxAndUpRangeTime: number;
};

function Sidebar({
  displayResolutionArray,
  setDisplayResolutionArray,
  resolutionLabelColorArray,
  rangeSliderResolutionTime,
  setRangeSliderResolutionTime,
  minRangeTime,
  maxAndUpRangeTime,
}: Props) {
  const oneHourInMilliseconds = 3600000;
  const handleCheckboxChange = (label: string) => {
    setDisplayResolutionArray((prevState) =>
      prevState.map((item) =>
        item.label === label
          ? {
              ...item,
              visibility: !item.visibility,
            }
          : item
      )
    );
  };

  const marks = [
    { value: minRangeTime, label: '0' },
    { value: 3600000, label: '1' },
    { value: 7200000, label: '2' },
    { value: 10800000, label: '3' },
    { value: 14400000, label: '4' },
    { value: 18000000, label: '5' },
    { value: 21600000, label: '6' },
    { value: 25200000, label: '7' },
    { value: 28800000, label: '8' },
    { value: 32400000, label: '9' },
    { value: 36000000, label: '10' },
    { value: 39600000, label: '11' },
    { value: maxAndUpRangeTime, label: '12+' },
  ];

  function valuetext(value: number) {
    return `${value}`;
  }

  const handleChange = (event: Event, newRangeSliderResolutionTime: number | number[]) => {
    setRangeSliderResolutionTime(newRangeSliderResolutionTime as number[]);
  };

  const getCircleBackgroundColor = (label: string): string => {
    const resolution = resolutionLabelColorArray.find((item) => item.label === label);
    return resolution ? resolution.color : 'mediumPurple';
  };

  return (
    <div className="sidebar">
      <img src={logo} alt={'a New York State vanity plate that says TOLLS L.O.L'} />
      <h1>Obscured License Plates Map</h1>
      <h2>Visualizing NYC's 311 Complaint Data</h2>
      <div className="sidebar-links-and-loader">
        <section className="link-section">
          <a
            className="source-link"
            href="https://github.com/snphillips/obscured-license-plate-visualizer.git"
            target="_new"
          >
            View code in Github ↗
          </a>
          <a
            className="source-link"
            href="https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9/explore/query/SELECT%0A%20%20%60unique_key%60%2C%0A%20%20%60created_date%60%2C%0A%20%20%60closed_date%60%2C%0A%20%20%60agency%60%2C%0A%20%20%60agency_name%60%2C%0A%20%20%60complaint_type%60%2C%0A%20%20%60descriptor%60%2C%0A%20%20%60location_type%60%2C%0A%20%20%60incident_zip%60%2C%0A%20%20%60incident_address%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60cross_street_1%60%2C%0A%20%20%60cross_street_2%60%2C%0A%20%20%60intersection_street_1%60%2C%0A%20%20%60intersection_street_2%60%2C%0A%20%20%60address_type%60%2C%0A%20%20%60city%60%2C%0A%20%20%60landmark%60%2C%0A%20%20%60facility_type%60%2C%0A%20%20%60status%60%2C%0A%20%20%60due_date%60%2C%0A%20%20%60resolution_description%60%2C%0A%20%20%60resolution_action_updated_date%60%2C%0A%20%20%60community_board%60%2C%0A%20%20%60bbl%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60x_coordinate_state_plane%60%2C%0A%20%20%60y_coordinate_state_plane%60%2C%0A%20%20%60open_data_channel_type%60%2C%0A%20%20%60park_facility_name%60%2C%0A%20%20%60park_borough%60%2C%0A%20%20%60vehicle_type%60%2C%0A%20%20%60taxi_company_borough%60%2C%0A%20%20%60taxi_pick_up_location%60%2C%0A%20%20%60bridge_highway_name%60%2C%0A%20%20%60bridge_highway_direction%60%2C%0A%20%20%60road_ramp%60%2C%0A%20%20%60bridge_highway_segment%60%2C%0A%20%20%60latitude%60%2C%0A%20%20%60longitude%60%2C%0A%20%20%60location%60%2C%0A%20%20%60%3A%40computed_region_efsh_h5xi%60%2C%0A%20%20%60%3A%40computed_region_f5dn_yrer%60%2C%0A%20%20%60%3A%40computed_region_yeji_bk3q%60%2C%0A%20%20%60%3A%40computed_region_92fq_4b7q%60%2C%0A%20%20%60%3A%40computed_region_sbqj_enih%60%2C%0A%20%20%60%3A%40computed_region_7mpf_4k6g%60%0AWHERE%0A%20%20caseless_one_of(%60complaint_type%60%2C%20%22Illegal%20Parking%22)%0A%20%20AND%20(caseless_one_of(%60descriptor%60%2C%20%22License%20Plate%20Obscured%22)%0A%20%20%20%20%20%20%20%20%20AND%20(%60created_date%60%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3E%20%222023-12-31T08%3A24%3A14%22%20%3A%3A%20floating_timestamp))%0AORDER%20BY%20%60created_date%60%20DESC%20NULL%20FIRST"
            target="_new"
          >
            View nyc.gov source data ↗
          </a>
        </section>
        <section className="loading-container">
          <LoadingSpinner />
        </section>
      </div>
      <hr />
      <h3>Complaint Resolution:</h3>

      {displayResolutionArray.map((item) => (
        <div key={item.label} className="resolution-filter-input">
          <input
            type="checkbox"
            id={`checkbox-${item.label}`}
            checked={item.visibility}
            onChange={() => handleCheckboxChange(item.label)}
          />
          <label htmlFor={`checkbox-${item.label}`}>{item.label}</label>
          <span className="circle-example" style={{ backgroundColor: getCircleBackgroundColor(item.label) }} />
        </div>
      ))}

      <hr />
      <h3 className="slider-header">Resolution Time Range in Hours:</h3>
      <Box sx={{ width: 260, mt: 4 }}>
        <Slider
          getAriaLabel={() => 'Time complaint resolved in range'}
          value={rangeSliderResolutionTime}
          onChange={handleChange}
          valueLabelDisplay="off"
          getAriaValueText={valuetext}
          step={oneHourInMilliseconds}
          marks={marks}
          min={minRangeTime}
          max={maxAndUpRangeTime}
          sx={{
            '& .MuiSlider-markLabel': {
              color: 'white',
              top: '-20px',
              fontSize: '10px',
            },
          }}
        />
      </Box>
    </div>
  );
}

export default Sidebar;
