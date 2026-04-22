import React, { useState } from 'react';
import axios from 'axios';

function SelfRatingBlock({ block, sessionId, apiUrl, onComplete }) {
  const [rating, setRating] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      await axios.post(`${apiUrl}/sessions/${sessionId}/self-rating`, {
        rating
      });
      setSubmitted(true);
      setTimeout(() => {
        onComplete({ rating });
      }, 500);
    } catch (error) {
      console.error('Error saving self-rating:', error);
      alert('Fout bij opslaan. Probeer opnieuw.');
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', color: '#667eea' }}>Bedankt! Volgende...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>{block.prompt}</h2>

      <div className="slider-container">
        <input
          type="range"
          min={block.minValue}
          max={block.maxValue}
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          className="slider"
        />
        <div className="slider-value">{rating}</div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
          0 = heel slecht | 100 = heel goed
        </p>
        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            Volgende
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelfRatingBlock;
