import { DisplayResolutionArrayType, setDisplayResolutionArrayType, resolutionLabelColorArrayType } from '../types';

type Props = {
  displayResolutionArray: DisplayResolutionArrayType;
  setDisplayResolutionArray: setDisplayResolutionArrayType;
  resolutionLabelColorArray: resolutionLabelColorArrayType;
};

function ResolutionCheckbox({ displayResolutionArray, setDisplayResolutionArray, resolutionLabelColorArray }: Props) {
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

  const getCircleBackgroundColor = (label: string): string => {
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
          <span>count:{item.count}</span>
        </div>
      ))}
    </section>
  );
}

export default ResolutionCheckbox;
