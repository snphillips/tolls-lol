import { Popup } from 'react-map-gl';
// import { howLongTillComplaintResolvedUtil } from '../utils/howLongTillComplaintResolvedUtil';
import { howLongTillComplaintResolvedPhrase } from '../utils/howLongTillComplaintResolvedPhrase';
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
            {selectedComplaint.status === 'Closed' && (
              <>
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
                <h4>Resolution:</h4>
                <p className="popup-content">{selectedComplaint.resolution_description}</p>
                <p>{selectedComplaint.closed_date ? howLongTillComplaintResolvedPhrase(selectedComplaint) : ''}</p>
              </>
            )}
          </div>
        </Popup>
      )}
    </>
  );
}

export default PopUp;
