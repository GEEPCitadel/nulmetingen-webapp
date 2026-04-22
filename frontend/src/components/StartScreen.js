import React from 'react';

function StartScreen({ onStartAssessment }) {
  return (
    <div className="screen start-screen">
      <h2>Welkom!</h2>
      <p>
        Dit is een meting van jouw digitale geletterdheid. De test duurt ongeveer 30 minuten.
        Je zult vragen zien over computers, internet, veiligheid, en nog veel meer.
      </p>

      <div className="info-box">
        <h3>Wat gaat er gebeuren?</h3>
        <ul>
          <li>Eerst geef je jezelf een cijfer voor je digitale vaardigheden</li>
          <li>Daarna beantwoord je meerkeuzevragen</li>
          <li>Je doet drie praktische taken (bestandsbeheer, bronbeoordeling, phishing)</li>
          <li>Aan het einde krijg je je score te zien</li>
        </ul>
      </div>

      <div className="info-box">
        <h3>Wat moet je weten?</h3>
        <ul>
          <li>Er is een timer die je voortgang volgt</li>
          <li>Antwoorden worden automatisch opgeslagen</li>
          <li>Je kunt niet teruggaan naar vorige vragen in sommige onderdelen</li>
          <li>Doe je best en kies wat jij denkt dat juist is</li>
        </ul>
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={() => onStartAssessment('lj1-vmbo')}
        >
          Start Test - Leerjaar 1 VMBO
        </button>
      </div>
    </div>
  );
}

export default StartScreen;
