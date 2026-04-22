import React, { useState } from 'react';
import axios from 'axios';

function PhishingDetectionBlock({ block, sessionId, apiUrl, onComplete }) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [judgments, setJudgments] = useState({});
  const [selectedFeatures, setSelectedFeatures] = useState({});
  const [step, setStep] = useState('judge'); // judge or feature

  const currentItem = block.items[currentItemIndex];
  const isLastItem = currentItemIndex === block.items.length - 1;

  const handleJudgment = (judgment) => {
    setJudgments(prev => ({
      ...prev,
      [currentItem.id]: judgment
    }));

    // If "Veilig", skip feature question
    if (judgment === 'Veilig') {
      completeItem(judgment, null);
    } else {
      setStep('feature');
    }
  };

  const handleFeature = async (feature) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [currentItem.id]: feature
    }));
    completeItem(judgments[currentItem.id], feature);
  };

  const completeItem = async (judgment, feature) => {
    const isCorrectJudgment = judgment === currentItem.correctJudgment;
    const isCorrectFeature = !feature || feature === currentItem.correctFeature;
    const isCorrect = isCorrectJudgment && isCorrectFeature;

    try {
      await axios.post(`${apiUrl}/responses`, {
        sessionId,
        instrumentId: 'lj1-vmbo',
        blockId: 'pt3-block',
        itemId: currentItem.id,
        presentedOptionOrder: currentItem.judgeOptions,
        selectedOptionId: judgment + (feature ? ` - ${feature}` : ''),
        selectedUnknown: false,
        isCorrect,
        responseTimeMs: 0
      });
    } catch (error) {
      console.error('Error saving response:', error);
    }

    // Move to next or complete
    if (isLastItem) {
      setTimeout(() => onComplete(judgments), 300);
    } else {
      setCurrentItemIndex(currentItemIndex + 1);
      setStep('judge');
    }
  };

  const getMockupContent = () => {
    switch (currentItem?.mockupType) {
      case 'school-email':
        return (
          <div className="mockup-email">
            <h3>Van: noreply@onzeschool.nl</h3>
            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Onderwerp: Informatie voor ouders</h4>
            <div className="mockup-article-content" style={{ marginTop: '1rem' }}>
              <p>Beste ouders en leerlingen,</p>
              <p style={{ marginTop: '1rem' }}>
                Dit is een regulier bericht van onze schooladministratie over aanstaande activiteiten.
              </p>
              <p style={{ marginTop: '1rem' }}>
                Met vriendelijke groet,<br />
                Het administratieteam van Onze School<br />
                noreply@onzeschool.nl
              </p>
            </div>
          </div>
        );
      case 'phishing-netflix':
        return (
          <div className="mockup-email" style={{ borderLeft: '4px solid #d32f2f' }}>
            <h3 style={{ color: '#d32f2f' }}>Van: security-verify@netflx-safe.com</h3>
            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>⚠️ URGENT: Verifieer je account NU!</h4>
            <div className="mockup-article-content" style={{ marginTop: '1rem', color: '#d32f2f' }}>
              <p>Je Netflix-account is GEBLOKKEERD!</p>
              <p style={{ marginTop: '1rem' }}>
                Klik ONMIDDELLIJK op onderstaande link om je account terug te krijgen.
                Je hebt slechts 1 uur om dit te doen!
              </p>
              <button style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                KLIK HIER NU - ACCOUNT HERSTELLEN
              </button>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                Link gaat naar: safenetflx-verify.ru/login
              </p>
            </div>
          </div>
        );
      case 'phishing-postnl':
        return (
          <div className="mockup-email" style={{ borderLeft: '4px solid #ff9800' }}>
            <h3>Van: +31612345678 (SMS)</h3>
            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>PostNL: Pakket niet bezorgd</h4>
            <div className="mockup-article-content" style={{ marginTop: '1rem' }}>
              <p>Hallo,</p>
              <p style={{ marginTop: '1rem' }}>
                Je pakket kon niet worden bezorgd. Klik hier om het opnieuw in te plannen:
                http://postnul-update.ru/trackpakket
              </p>
            </div>
          </div>
        );
      case 'phishing-whatsapp':
        return (
          <div className="mockup-email">
            <h3>Van: +31698765432</h3>
            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Chat bericht</h4>
            <div className="mockup-article-content" style={{ marginTop: '1rem' }}>
              <p><strong>Hey, ik ben het Sam!</strong></p>
              <p style={{ marginTop: '0.5rem' }}>
                Ik zit even zonder geld... Kan jij me nu 50 euro overmaken? Ik betaal het morgen terug, beloofd!
              </p>
              <p style={{ marginTop: '0.5rem' }}>
                IBAN: NL92ABCDABCD123456789
              </p>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#999' }}>
              Bericht van onbekend nummer
            </p>
          </div>
        );
      default:
        return <div>Laadt...</div>;
    }
  };

  const judgment = judgments[currentItem?.id];

  if (!currentItem) return <div>Laadt...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>
          Item {currentItemIndex + 1} van {block.items.length}
        </h3>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>Phishing Detection</h2>

      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Is deze e-mail, SMS of chat bericht verdacht of veilig?
      </p>

      {getMockupContent()}

      {step === 'judge' && (
        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#333', marginTop: '2rem' }}>
            Wat denk je van dit bericht?
          </p>
          <div className="options-container">
            {currentItem.judgeOptions.map((option, idx) => (
              <button
                key={idx}
                className="option-button"
                onClick={() => handleJudgment(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'feature' && judgment && judgment !== 'Veilig' && (
        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#333', marginTop: '2rem' }}>
            Wat maakt dit verdacht?
          </p>
          <div className="options-container">
            {currentItem.featureOptions.map((option, idx) => (
              <button
                key={idx}
                className="option-button"
                onClick={() => handleFeature(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhishingDetectionBlock;
