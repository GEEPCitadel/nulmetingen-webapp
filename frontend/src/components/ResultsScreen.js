import React from 'react';

function ResultsScreen({ results, instrumentId, onReturnToStart }) {
  const getMcResponses = () => {
    return results.responses.filter(r => r.blockId === 'mc-block');
  };

  const getPt1Responses = () => {
    return results.responses.filter(r => r.blockId === 'pt1-block');
  };

  const getPt2Responses = () => {
    return results.responses.filter(r => r.blockId === 'pt2-block');
  };

  const getPt3Responses = () => {
    return results.responses.filter(r => r.blockId === 'pt3-block');
  };

  const mcResponses = getMcResponses();
  const pt1Correct = getPt1Responses().filter(r => r.isCorrect).length;
  const pt2Correct = getPt2Responses().filter(r => r.isCorrect).length;
  const pt3Correct = getPt3Responses().filter(r => r.isCorrect).length;

  return (
    <div className="screen results-screen">
      <h2>Je bent klaar!</h2>
      <div className="score-display">{results.percentage}%</div>
      <p className="score-text">
        Je hebt {results.totalCorrect} van {results.totalItems} vragen correct beantwoord.
      </p>

      <div className="detailed-results">
        <h3>Gedetailleerde Score</h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong>Meerkeuzevragen:</strong>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            {mcResponses.filter(r => r.isCorrect).length} van {mcResponses.length} correct
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong>Bestandsbeheer (PT1):</strong>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            {pt1Correct} van {getPt1Responses().length} taken correct
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong>Bronbeoordeling (PT2):</strong>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            {pt2Correct} van {getPt2Responses().length} items correct
          </p>
        </div>

        <div>
          <strong>Phishing Detection (PT3):</strong>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            {pt3Correct} van {getPt3Responses().length} items correct
          </p>
        </div>
      </div>

      <p style={{ color: '#666', marginTop: '2rem', marginBottom: '2rem', lineHeight: '1.6' }}>
        Bedankt dat je deze meting hebt voltooid! Je antwoorden geven ons inzicht in
        jouw huidige digitale vaardigheden. Deze informatie helpt ons bij het
        ontwerpen van het juiste onderwijs.
      </p>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={onReturnToStart}
        >
          Terug naar start
        </button>
      </div>
    </div>
  );
}

export default ResultsScreen;
