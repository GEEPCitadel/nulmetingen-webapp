-- Nulmetingen DG Assessment Database Schema
-- Afnamecodes zijn willekeurige, anonieme codes per klas. Sla geen namen,
-- leerlingnummers of een koppeltabel tussen die gegevens en codes op.
-- Resultaten worden zonder afnamecode, naam of leerlingnummer opgeslagen.

CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  access_code TEXT NOT NULL,
  class_code TEXT NOT NULL,
  version_id TEXT NOT NULL,
  import_batch TEXT,
  status TEXT NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_sessions (
  id UUID PRIMARY KEY,
  access_code TEXT,
  class_code TEXT,
  class_id TEXT,
  class_token TEXT,
  anonymous_attempt_id TEXT,
  version_id TEXT NOT NULL,
  session_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_results (
  session_id UUID PRIMARY KEY,
  class_code TEXT,
  class_id TEXT,
  version_id TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  self_assessment_score INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ NOT NULL,
  result_json JSONB NOT NULL,
  event_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_class_code ON students(class_code);
CREATE INDEX IF NOT EXISTS idx_students_access_code ON students(access_code);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_sessions_access_code ON assessment_sessions(access_code);
CREATE INDEX IF NOT EXISTS idx_sessions_class_code ON assessment_sessions(class_code);
CREATE INDEX IF NOT EXISTS idx_results_class_code ON assessment_results(class_code);
CREATE INDEX IF NOT EXISTS idx_results_version_id ON assessment_results(version_id);
