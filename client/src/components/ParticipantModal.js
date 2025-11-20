import React from "react";
import "../styles/ParticipantModal.css";

function ParticipantModal({ isOpen, onClose, runName, participants, loading, error, onRemoveParticipant }) {
  if (!isOpen) return null;

  return (
    <div className="participant-modal-overlay" onClick={onClose}>
      <div className="participant-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="participant-modal-header">
          <h2>Participants - {runName}</h2>
          <button className="participant-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="participant-modal-body">
          {loading && <p>Loading participants...</p>}
          
          {error && <p className="participant-modal-error">Error: {error}</p>}
          
          {!loading && !error && participants.length === 0 && (
            <p>No participants yet.</p>
          )}
          
          {!loading && !error && participants.length > 0 && (
            <div className="participants-list">
              <p><strong>{participants.length} participant{participants.length !== 1 ? 's' : ''}</strong></p>
              {participants.map((participant) => (
                <div key={participant.runner_id} className="participant-item">
                  <div className="participant-info">
                    <div className="participant-name">
                      {participant.first_name} {participant.last_name}
                    </div>
                    <div className="participant-email">
                      {participant.email}
                    </div>
                  </div>
                  {onRemoveParticipant && (
                    <button
                      className="participant-remove-icon"
                      onClick={() => onRemoveParticipant(participant.runner_id)}
                      title="Remove participant"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParticipantModal;
