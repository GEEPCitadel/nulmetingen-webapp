import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AssessmentScreen from './components/AssessmentScreen';
import StartScreen from './components/StartScreen';
import ResultsScreen from './components/ResultsScreen';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [screen, setScreen] = useState('start'); // start, assessment, results
  const [instrumentId, setInstrumentId] = useState('lj1-vmbo');
  const [sessionId, setSessionId] = useState(null);
  const [results, setResults] = useState(null);

  const handleStartAssessment = async (instrument) => {
    try {
      setInstrumentId(instrument);
      const response = await axios.post(`${API_URL}/sessions`, {
        instrumentId: instrument
      });
      setSessionId(response.data.sessionId);
      setScreen('assessment');
    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Fout bij het starten van de test. Probeer het opnieuw.');
    }
  };

  const handleAssessmentComplete = async (assessmentResults) => {
    try {
      // End session
      await axios.put(`${API_URL}/sessions/${sessionId}/end`, {});

      // Fetch final results
      const response = await axios.get(`${API_URL}/sessions/${sessionId}/results`);
      setResults(response.data);
      setScreen('results');
    } catch (error) {
      console.error('Error completing assessment:', error);
      alert('Fout bij het afronden van de test.');
    }
  };

  const handleReturnToStart = () => {
    setScreen('start');
    setSessionId(null);
    setResults(null);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Nulmetingen Digitale Geletterdheid</h1>
        <p>Assessment voor begripsniveaus en vaardigheden</p>
      </header>

      <main className="content">
        {screen === 'start' && (
          <StartScreen onStartAssessment={handleStartAssessment} />
        )}

        {screen === 'assessment' && sessionId && (
          <AssessmentScreen
            sessionId={sessionId}
            instrumentId={instrumentId}
            apiUrl={API_URL}
            onComplete={handleAssessmentComplete}
          />
        )}

        {screen === 'results' && results && (
          <ResultsScreen
            results={results}
            instrumentId={instrumentId}
            onReturnToStart={handleReturnToStart}
          />
        )}
      </main>
    </div>
  );
}

export default App;
