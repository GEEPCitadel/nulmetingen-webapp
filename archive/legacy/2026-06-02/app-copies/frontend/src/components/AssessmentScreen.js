import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SelfRatingBlock from './blocks/SelfRatingBlock';
import MultipleChoiceBlock from './blocks/MultipleChoiceBlock';
import FileManagementBlock from './blocks/FileManagementBlock';
import SourceEvaluationBlock from './blocks/SourceEvaluationBlock';
import PhishingDetectionBlock from './blocks/PhishingDetectionBlock';
import instrumentData from '../../data/instrumentData';

function AssessmentScreen({ sessionId, instrumentId, apiUrl, onComplete }) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [responses, setResponses] = useState({});

  const instrument = instrumentData[instrumentId];
  const blocks = instrument.blocks;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleBlockComplete = (blockResponses) => {
    setResponses(prev => ({
      ...prev,
      [blocks[currentBlock].id]: blockResponses
    }));

    if (currentBlock < blocks.length - 1) {
      setCurrentBlock(currentBlock + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    onComplete(responses);
  };

  const currentBlockData = blocks[currentBlock];
  const progressPercent = ((currentBlock + 1) / blocks.length) * 100;

  return (
    <div className="screen">
      <div style={{ marginBottom: '2rem' }}>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
          <span>Onderdeel {currentBlock + 1} van {blocks.length}</span>
          <span className={timeRemaining < 300 ? 'timer warning' : ''}>
            ⏱️ {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {currentBlockData.type === 'self-rating' && (
        <SelfRatingBlock
          block={currentBlockData}
          sessionId={sessionId}
          apiUrl={apiUrl}
          onComplete={handleBlockComplete}
        />
      )}

      {currentBlockData.type === 'multiple-choice' && (
        <MultipleChoiceBlock
          block={currentBlockData}
          sessionId={sessionId}
          apiUrl={apiUrl}
          onComplete={handleBlockComplete}
        />
      )}

      {currentBlockData.type === 'file-management' && (
        <FileManagementBlock
          block={currentBlockData}
          sessionId={sessionId}
          apiUrl={apiUrl}
          onComplete={handleBlockComplete}
        />
      )}

      {currentBlockData.type === 'source-evaluation' && (
        <SourceEvaluationBlock
          block={currentBlockData}
          sessionId={sessionId}
          apiUrl={apiUrl}
          onComplete={handleBlockComplete}
        />
      )}

      {currentBlockData.type === 'phishing-detection' && (
        <PhishingDetectionBlock
          block={currentBlockData}
          sessionId={sessionId}
          apiUrl={apiUrl}
          onComplete={handleBlockComplete}
        />
      )}
    </div>
  );
}

export default AssessmentScreen;
