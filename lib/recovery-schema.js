export const ensureRecoveryTable = sql => sql`
  CREATE TABLE IF NOT EXISTS assessment_recoveries (
    session_id UUID PRIMARY KEY,
    class_code TEXT NOT NULL,
    version_id TEXT NOT NULL,
    state TEXT NOT NULL,
    source_checksum TEXT NOT NULL,
    source_session_json JSONB NOT NULL,
    missing_item_ids JSONB NOT NULL,
    recovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
