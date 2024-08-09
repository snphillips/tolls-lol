import { Popup } from 'react-map-gl';
import './PopUp.css';
import { howLongTillResolvedPhrase } from '../utils/howLongTillResolvedPhrase';
import { ComplaintType, SetSelectedComplaintType } from '../types';

type PropsType = {
  selectedComplaint: ComplaintType;
  setSelectedComplaint: SetSelectedComplaintType;
};

function PopUp({ selectedComplaint, setSelectedComplaint }: PropsType) {
  return (
    <>
      {selectedComplaint.latitude && selectedComplaint.longitude && (
        <Popup
          latitude={parseFloat(selectedComplaint.latitude)}
          longitude={parseFloat(selectedComplaint.longitude)}
          onClose={() => setSelectedComplaint(null)}
          closeOnClick={false}
          closeButton={true}
        >
          <div className="popup-container">
            <h3 id="incident_address">
              {selectedComplaint.incident_address.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase())}
            </h3>
            <div className="popup-section">
              <p className="popup-section-label">Opened: </p>
              <p className="popup-content">
                {new Date(selectedComplaint.created_date).toLocaleString('en-us', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {selectedComplaint.status === 'Closed' && (
              <>
                <div className="popup-section">
                  <p className="popup-section-label">Closed: </p>
                  <p className="popup-content">
                    {selectedComplaint.closed_date
                      ? new Date(selectedComplaint.closed_date).toLocaleString('en-us', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Complaint is still open'}
                  </p>
                </div>
                <p className="popup-section-label">Resolution: </p>
                <p className="popup-content">{selectedComplaint.resolution_description}</p>
                <p>{selectedComplaint.closed_date ? howLongTillResolvedPhrase(selectedComplaint) : ''}</p>
              </>
            )}
          </div>
        </Popup>
      )}
    </>
  );
}

export default PopUp;
