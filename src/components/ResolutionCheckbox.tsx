import {
  DisplayResolutionArrayType,
  SetDisplayResolutionArrayType,
  ResolutionLabelColorArrayType,
  ResolutionLabelType,
  ColorTypes,
} from '../types';

type Props = {
  displayResolutionArray: DisplayResolutionArrayType;
  setDisplayResolutionArray: SetDisplayResolutionArrayType;
  resolutionLabelColorArray: ResolutionLabelColorArrayType;
};

function ResolutionCheckbox({ displayResolutionArray, setDisplayResolutionArray, resolutionLabelColorArray }: Props) {
  const handleCheckboxChange = (label: ResolutionLabelType) => {
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

  const getCircleBackgroundColor = (label: ResolutionLabelType): ColorTypes => {
    const resolution = resolutionLabelColorArray.find((item) => item.label === label);
    return resolution ? resolution.color : 'mediumPurple';
  };

  return (
    <section className="checkbox-section">
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
    </section>
  );
}

export default ResolutionCheckbox;
