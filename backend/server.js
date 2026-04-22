const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database initialization
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(path.join(dbDir, 'nulmetingen.db'));

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        sessionId TEXT PRIMARY KEY,
        instrumentId TEXT NOT NULL,
        startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        endTime DATETIME,
        status TEXT DEFAULT 'active',
        selfRating INTEGER
      )
    `);

    // Responses table
    db.run(`
      CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId TEXT NOT NULL,
        instrumentId TEXT NOT NULL,
        blockId TEXT NOT NULL,
        itemId TEXT NOT NULL,
        presentedOptionOrder TEXT,
        selectedOptionId TEXT,
        selectedUnknown BOOLEAN DEFAULT 0,
        isCorrect BOOLEAN,
        responseTimeMs INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sessionId) REFERENCES sessions(sessionId)
      )
    `);

    // PT1 Actions table
    db.run(`
      CREATE TABLE IF NOT EXISTS pt1_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId TEXT NOT NULL,
        actionType TEXT NOT NULL,
        sourcePath TEXT,
        targetPath TEXT,
        oldName TEXT,
        newName TEXT,
        extra TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sessionId) REFERENCES sessions(sessionId)
      )
    `);

    // PT1 Final state
    db.run(`
      CREATE TABLE IF NOT EXISTS pt1_final_states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId TEXT NOT NULL,
        fileSystemState TEXT,
        pt1Score INTEGER,
        tasksCompleted TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sessionId) REFERENCES sessions(sessionId)
      )
    `);
  });
}

initializeDatabase();

// API Routes

// 1. Create session
app.post('/api/sessions', (req, res) => {
  const { instrumentId } = req.body;
  const sessionId = uuidv4();

  db.run(
    'INSERT INTO sessions (sessionId, instrumentId) VALUES (?, ?)',
    [sessionId, instrumentId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ sessionId, instrumentId, startTime: new Date() });
      }
    }
  );
});

// 2. Save self-rating
app.post('/api/sessions/:sessionId/self-rating', (req, res) => {
  const { sessionId } = req.params;
  const { rating } = req.body;

  db.run(
    'UPDATE sessions SET selfRating = ? WHERE sessionId = ?',
    [rating, sessionId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// 3. Save response (MC or PT)
app.post('/api/responses', (req, res) => {
  const {
    sessionId,
    instrumentId,
    blockId,
    itemId,
    presentedOptionOrder,
    selectedOptionId,
    selectedUnknown,
    isCorrect,
    responseTimeMs
  } = req.body;

  db.run(
    `INSERT INTO responses
     (sessionId, instrumentId, blockId, itemId, presentedOptionOrder, selectedOptionId, selectedUnknown, isCorrect, responseTimeMs)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [sessionId, instrumentId, blockId, itemId, JSON.stringify(presentedOptionOrder), selectedOptionId, selectedUnknown ? 1 : 0, isCorrect ? 1 : 0, responseTimeMs],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true, responseId: this.lastID });
      }
    }
  );
});

// 4. Save PT1 action
app.post('/api/pt1-actions', (req, res) => {
  const { sessionId, actionType, sourcePath, targetPath, oldName, newName, extra } = req.body;

  db.run(
    `INSERT INTO pt1_actions
     (sessionId, actionType, sourcePath, targetPath, oldName, newName, extra)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [sessionId, actionType, sourcePath, targetPath, oldName, newName, extra],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// 5. Save PT1 final state
app.post('/api/pt1-final-state', (req, res) => {
  const { sessionId, fileSystemState, pt1Score, tasksCompleted } = req.body;

  db.run(
    `INSERT INTO pt1_final_states
     (sessionId, fileSystemState, pt1Score, tasksCompleted)
     VALUES (?, ?, ?, ?)`,
    [sessionId, JSON.stringify(fileSystemState), pt1Score, JSON.stringify(tasksCompleted)],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// 6. End session
app.put('/api/sessions/:sessionId/end', (req, res) => {
  const { sessionId } = req.params;

  db.run(
    'UPDATE sessions SET status = ?, endTime = ? WHERE sessionId = ?',
    ['completed', new Date().toISOString(), sessionId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// 7. Get session results
app.get('/api/sessions/:sessionId/results', (req, res) => {
  const { sessionId } = req.params;

  db.all(
    'SELECT * FROM responses WHERE sessionId = ?',
    [sessionId],
    (err, responses) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const totalCorrect = responses.filter(r => r.isCorrect).length;
        const totalItems = responses.length;
        const percentage = totalItems > 0 ? Math.round((totalCorrect / totalItems) * 100) : 0;

        res.json({
          sessionId,
          totalCorrect,
          totalItems,
          percentage,
          responses
        });
      }
    }
  );
});

// 8. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
