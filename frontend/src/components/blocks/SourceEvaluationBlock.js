import React, { useState } from 'react';
import axios from 'axios';

function SourceEvaluationBlock({ block, sessionId, apiUrl, onComplete }) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [judgments, setJudgments] = useState({});
  const [selectedReasons, setSelectedReasons] = useState({});
  const [reasonOptions, setReasonOptions] = useState({});
  const [step, setStep] = useState('judge'); // judge or reason

  const currentItem = block.items[currentItemIndex];
  const isLastItem = currentItemIndex === block.items.length - 1;

  const handleJudgment = (judgment) => {
    setJudgments(prev => ({
      ...prev,
      [currentItem.id]: judgment
    }));
    setStep('reason');
  };

  const handleReason = async (reason) => {
    setSelectedReasons(prev => ({
      ...prev,
      [currentItem.id]: reason
    }));

    const isCorrect = judgment === currentItem.correctJudgment && reason === currentItem.correctReason;
    const points = isCorrect ? currentItem.points : 0;

    try {
      await axios.post(`${apiUrl}/responses`, {
        sessionId,
        instrumentId: 'lj1-vmbo',
        blockId: 'pt2-block',
        itemId: currentItem.id,
        presentedOptionOrder: currentItem.reasonOptions,
        selectedOptionId: reason,
        selectedUnknown: false,
        isCorrect,
        responseTimeMs: 0
      });
    } catch (error) {
      console.error('Error saving response:', error);
    }

    // Move to next or complete
    if (isLastItem) {
      setTimeout(() => onComplete(selectedReasons), 300);
    } else {
      setCurrentItemIndex(currentItemIndex + 1);
      setStep('judge');
    }
  };

  const judgment = judgments[currentItem?.id];

  const getMockupContent = () => {
    switch (currentItem?.mockupType) {
      case 'news-article':
        return (
          <div className="mockup-article">
            <h2>NOS.nl - Artikel</h2>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Belangrijke ontdekking op het gebied van digitale technologie</h3>
            <p className="mockup-article-content">
              Een artikel van onze redactie, geschreven door een ervaren journalist, waarin
              we de nieuwste bevindingen uit betrouwbare bronnen bespreken. Dit artikel is
              opgesteld op basis van controleerbare feiten van de NOS-redactie.
            </p>
            <div className="mockup-meta">
              Auteur: Jan de Vries | Bron: NOS-redactie | Datum: vandaag
            </div>
          </div>
        );
      case 'tiktok-post':
        return (
          <div className="mockup-article" style={{ borderLeft: '4px solid #ff0050' }}>
            <h2 style={{ color: '#ff0050' }}>TikTok @anoniem_user</h2>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#d32f2f' }}>
              ⚠️ WAARSCHUWING: Dit zal je SCHOKKEN! 😱 Wetenschappers hebben ontdekt...
            </p>
            <p className="mockup-article-content">
              Een post met angsttaal en overdreven beweringen, zonder duidelijke bron of
              auteur. De post probeert virale aandacht te krijgen door angst aan te wakkeren.
            </p>
            <div className="mockup-meta">
              Anonieme maker | Geen controleerbare bron | Veel likes
            </div>
          </div>
        );
      case 'commercial-site':
        return (
          <div className="mockup-article" style={{ borderLeft: '4px solid #ff9800' }}>
            <h2>GezondeSuperFruit.nl - Extreme claims</h2>
            <p style={{ fontSize: '1.1rem', color: '#d32f2f' }}>
              HET WONDERMIDDEL TEGEN ALLES - 95% KORTING VANDAAG!
            </p>
            <p className="mockup-article-content">
              Een commerciële website die overdreven claims maakt over een product.
              Het doel is verkopen, niet informatief zijn. De beweringen zijn
              niet ondersteund door onafhankelijk onderzoek.
            </p>
            <div className="mockup-meta">
              Website: Wij verkopen dit product | Geen externe bron | Veel druk
            </div>
          </div>
        );
      case 'educational-article':
        return (
          <div className="mockup-article" style={{ borderLeft: '4px solid #4caf50' }}>
            <h2>Schooltv.nl - Artikel</h2>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Hoe werken algoritmes?</h3>
            <p className="mockup-article-content">
              Dit artikel is geschreven door een redacteur van Schooltv en maakt gebruik
              van inzichten van een erkende expert. Het is speciaal ontworpen voor
              jongeren en gebaseerd op betrouwbare wetenschappelijke bronnen.
            </p>
            <div className="mockup-meta">
              Redacteur: Anita Smit | Expert: Dr. Paul de Programeur | Bron: Universitaire onderzoeken
            </div>
          </div>
        );
      default:
        return <div>Laadt...</div>;
    }
  };

  if (!currentItem) return <div>Laadt...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>
          Item {currentItemIndex + 1} van {block.items.length}
        </h3>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>Bronbeoordeling</h2>

      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Beoordeel deze bron: is deze betrouwbaar of niet?
      </p>

      {getMockupContent()}

      {step === 'judge' && (
        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#333' }}>
            Wat vind je van deze bron?
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

      {step === 'reason' && judgment && (
        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#333' }}>
            Waarom vind je dat?
          </p>
          <div className="options-container">
            {currentItem.reasonOptions.map((option, idx) => (
              <button
                key={idx}
                className="option-button"
                onClick={() => handleReason(option)}
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

export default SourceEvaluationBlock;
