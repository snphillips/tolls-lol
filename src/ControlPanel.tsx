import {useState} from 'react';
import './ControlPanel.css';

// Helpful guide:
// https://github.com/visgl/react-map-gl/blob/7.1-release/examples/layers/src/control-panel.tsx

function ControlPanel() {

  const resolutionCategories = [
    `issued a summons in response to the complaint`,
    `took action to fix the condition`,
    `no evidence of violation`,
    `does not fall under the NYPD's jurisdiction`, 
    'police action was not necessary',
    'those responsible for the condition were gone',
    'provided additional information below'
  ];

  // not using yet
  const [visibility, setVisibility] = useState({
    summons: true,
    took_action: true,
    no_violation: true,
    not_police_jurisdiction: true,
    no_police_action: true,
    those_responsible_gone: true,
    provided_additional_information: true
  });

  return (
    <div className="control-panel">
      <h1>Obscured License Plates in NYC</h1>
      <h2>Visualizing 311 Complaint Data for 2024</h2>
      <div className="source-link">
        <a
          href=""
          target="_new"
        >
          View Code ↗
        </a>
      </div>
      <hr />
      <h3>Resolution</h3>
      {resolutionCategories.map(name => (
        <div key={name} className="input">
          <label>{name}</label>
          <input
            type="checkbox"
            defaultChecked={true}
            // checked={visibility[name]}
            // onChange={evt => onVisibilityChange(name, evt.target.checked)}
          />
        </div>
      ))}
              <h3>Time to Resolution</h3>
              <div>(insert time slider)</div>
    </div>
  );
}

export default ControlPanel;