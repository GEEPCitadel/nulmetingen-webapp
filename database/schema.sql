-- Nulmetingen DG Assessment Database Schema

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  sessionId TEXT PRIMARY KEY,
  instrumentId TEXT NOT NULL,
  startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  endTime DATETIME,
  status TEXT DEFAULT 'active', -- active, completed, abandoned
  selfRating INTEGER
);

-- Responses Table (MC, PT2, PT3)
CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId TEXT NOT NULL,
  instrumentId TEXT NOT NULL,
  blockId TEXT NOT NULL, -- mc-block, pt2-block, pt3-block
  itemId TEXT NOT NULL,
  presentedOptionOrder TEXT, -- JSON array
  selectedOptionId TEXT,
  selectedUnknown BOOLEAN DEFAULT 0,
  isCorrect BOOLEAN,
  responseTimeMs INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES sessions(sessionId)
);

-- PT1 Actions Table
CREATE TABLE IF NOT EXISTS pt1_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId TEXT NOT NULL,
  actionType TEXT NOT NULL, -- create-folder, move-file, rename-file, copy, delete, undo
  sourcePath TEXT,
  targetPath TEXT,
  oldName TEXT,
  newName TEXT,
  extra TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES sessions(sessionId)
);

-- PT1 Final States
CREATE TABLE IF NOT EXISTS pt1_final_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId TEXT NOT NULL,
  fileSystemState TEXT, -- JSON representation
  pt1Score INTEGER,
  tasksCompleted TEXT, -- JSON array
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES sessions(sessionId)
);

-- Indexes for performance
CREATE INDEX idx_sessions_instrumentId ON sessions(instrumentId);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_responses_sessionId ON responses(sessionId);
CREATE INDEX idx_responses_blockId ON responses(blockId);
CREATE INDEX idx_pt1_actions_sessionId ON pt1_actions(sessionId);
CREATE INDEX idx_pt1_final_states_sessionId ON pt1_final_states(sessionId);
