import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileManagementBlock({ block, sessionId, apiUrl, onComplete }) {
  const [fileSystem, setFileSystem] = useState(JSON.parse(JSON.stringify(block.initialFileSystem)));
  const [selectedItem, setSelectedItem] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});
  const [completedCount, setCompletedCount] = useState(0);

  const totalTasks = block.tasks.length;

  const handleAction = async (actionType, params) => {
    try {
      await axios.post(`${apiUrl}/pt1-actions`, {
        sessionId,
        actionType,
        ...params
      });

      // Update local file system simulation
      const newFS = JSON.parse(JSON.stringify(fileSystem));
      // File system logic would go here
      setFileSystem(newFS);

      // Mark task as completed based on action
      checkTaskCompletion(params);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const checkTaskCompletion = (params) => {
    // This would check if the user completed a task correctly
    // For now, simulated
  };

  const handleTaskComplete = (taskId) => {
    setTaskStatus(prev => ({
      ...prev,
      [taskId]: 'completed'
    }));
    setCompletedCount(completedCount + 1);
  };

  const handleFinish = async () => {
    try {
      await axios.post(`${apiUrl}/pt1-final-state`, {
        sessionId,
        fileSystemState: fileSystem,
        pt1Score: completedCount,
        tasksCompleted: Object.keys(taskStatus)
      });
      onComplete({ tasksCompleted: taskStatus });
    } catch (error) {
      console.error('Error saving final state:', error);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>Bestandsbeheer</h2>

      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Voer de volgende taken uit met het bestandssysteem. Je kunt slepen, rechtsklikken en ongedaan maken.
      </p>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '6px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Taken:</h3>
        <ul style={{ marginLeft: '1.5rem' }}>
          {block.tasks.map(task => (
            <li
              key={task.id}
              style={{
                marginBottom: '0.5rem',
                color: taskStatus[task.id] === 'completed' ? '#51cf66' : '#333',
                textDecoration: taskStatus[task.id] === 'completed' ? 'line-through' : 'none'
              }}
            >
              <strong>{task.id}:</strong> {task.instruction}
            </li>
          ))}
        </ul>
      </div>

      <div style={{
        background: '#f8f8f8',
        border: '1px solid #ddd',
        borderRadius: '6px',
        padding: '1rem',
        marginBottom: '2rem',
        minHeight: '300px',
        fontFamily: 'monospace'
      }}>
        <p style={{ color: '#999' }}>
          [Bestandsbeheer simulatie - Frontend simulatie met drag-and-drop ingebouwd]
        </p>
        <pre style={{ color: '#666', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
          Bureaublad/
          ├── huiswerk_cellen.docx
          ├── vakantie_strand.jpg
          ├── onbenoemd.docx
          ├── School/
          │   ├── Taal/
          │   │   └── Nederlands_proefwerk.docx
          │   └── Aardrijkskunde/
          ├── Foto's/
          │   ├── IMG_2034.jpg
          │   └── IMG_2035.jpg
          └── Downloads/
              ├── spreekbeurt_aardrijkskunde.pptx
              └── onbekend_bestand.png
        </pre>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#e8f0ff', borderRadius: '6px' }}>
        <p style={{ color: '#333' }}>
          <strong>Progress:</strong> {completedCount} van {totalTasks} taken voltooid
        </p>
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={completedCount < totalTasks}
        >
          Volgende Onderdeel
        </button>
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          Voltooi alle taken om door te gaan
        </p>
      </div>
    </div>
  );
}

export default FileManagementBlock;
