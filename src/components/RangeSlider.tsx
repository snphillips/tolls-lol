import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { setRangeSliderResolutionTimeType } from '../types';

type Props = {
  rangeSliderResolutionTime: number[];
  setRangeSliderResolutionTime: setRangeSliderResolutionTimeType;
  minRangeTime: number;
  maxAndUpRangeTime: number;
};

function RangeSlider({
  rangeSliderResolutionTime,
  setRangeSliderResolutionTime,
  minRangeTime,
  maxAndUpRangeTime,
}: Props) {
  const oneHourInMilliseconds = 3600000;
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

  return (
    <section id="range-slider-section">
      <h3 className="slider-header">Resolution Time Range in Hours:</h3>
      <Box sx={{ width: 250, mt: 4 }}>
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
    </section>
  );
}

export default RangeSlider;
