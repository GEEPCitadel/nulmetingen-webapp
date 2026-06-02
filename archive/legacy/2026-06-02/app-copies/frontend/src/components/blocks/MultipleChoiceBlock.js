import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MultipleChoiceBlock({ block, sessionId, apiUrl, onComplete }) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showUnknown, setShowUnknown] = useState({});
  const [shuffledOptions, setShuffledOptions] = useState({});
  const [startTimes, setStartTimes] = useState({});

  // Shuffle options on component mount
  useEffect(() => {
    const shuffled = {};
    block.items.forEach(item => {
      const shuffledOpts = [...item.options].sort(() => Math.random() - 0.5);
      shuffled[item.id] = shuffledOpts;
      startTimes[item.id] = Date.now();
    });
    setShuffledOptions(shuffled);
    setStartTimes(startTimes);
  }, [block.items]);

  const currentItem = block.items[currentItemIndex];
  const isLastItem = currentItemIndex === block.items.length - 1;
  const isAnswered = selectedAnswers[currentItem.id] !== undefined || showUnknown[currentItem.id];

  const handleSelectOption = async (optionText) => {
    const responseTime = Date.now() - (startTimes[currentItem.id] || Date.now());
    const isCorrect = optionText === currentItem.correctAnswer;

    setSelectedAnswers(prev => ({
      ...prev,
      [currentItem.id]: optionText
    }));

    // Save response
    try {
      await axios.post(`${apiUrl}/responses`, {
        sessionId,
        instrumentId: 'lj1-vmbo',
        blockId: 'mc-block',
        itemId: currentItem.id,
        presentedOptionOrder: shuffledOptions[currentItem.id] || currentItem.options,
        selectedOptionId: optionText,
        selectedUnknown: false,
        isCorrect,
        responseTimeMs: responseTime
      });
    } catch (error) {
      console.error('Error saving response:', error);
    }

    // Move to next or complete
    if (isLastItem) {
      setTimeout(() => onComplete(selectedAnswers), 300);
    } else {
      setTimeout(() => setCurrentItemIndex(currentItemIndex + 1), 300);
    }
  };

  const handleShowUnknown = async () => {
    const responseTime = Date.now() - (startTimes[currentItem.id] || Date.now());

    setShowUnknown(prev => ({
      ...prev,
      [currentItem.id]: true
    }));

    // Save response
    try {
      await axios.post(`${apiUrl}/responses`, {
        sessionId,
        instrumentId: 'lj1-vmbo',
        blockId: 'mc-block',
        itemId: currentItem.id,
        presentedOptionOrder: shuffledOptions[currentItem.id] || currentItem.options,
        selectedOptionId: null,
        selectedUnknown: true,
        isCorrect: false,
        responseTimeMs: responseTime
      });
    } catch (error) {
      console.error('Error saving response:', error);
    }

    // Move to next or complete
    if (isLastItem) {
      setTimeout(() => onComplete(selectedAnswers), 300);
    } else {
      setTimeout(() => setCurrentItemIndex(currentItemIndex + 1), 300);
    }
  };

  if (!shuffledOptions[currentItem?.id]) {
    return <p>Laden...</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>
          Vraag {currentItemIndex + 1} van {block.items.length}
        </h3>
      </div>

      <div className="question-stem">
        {currentItem.stem}
      </div>

      <div className="options-container">
        {shuffledOptions[currentItem.id].map((option, idx) => (
          <button
            key={idx}
            className={`option-button ${
              selectedAnswers[currentItem.id] === option ? 'selected' : ''
            }`}
            onClick={() => handleSelectOption(option)}
            disabled={!!selectedAnswers[currentItem.id] || showUnknown[currentItem.id]}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        className={`unknown-button ${showUnknown[currentItem.id] ? 'selected' : ''}`}
        onClick={handleShowUnknown}
        disabled={!!selectedAnswers[currentItem.id] || showUnknown[currentItem.id]}
      >
        Weet ik niet
      </button>

      {isAnswered && (
        <div className="button-group" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            {isLastItem ? 'Antwoord opgeslagen. Volgende onderdeel...' : 'Antwoord opgeslagen.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default MultipleChoiceBlock;
