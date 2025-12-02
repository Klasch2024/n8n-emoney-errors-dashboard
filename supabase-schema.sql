-- Create the simplified errors table with only the columns we actually use
CREATE TABLE IF NOT EXISTS workflow_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id TEXT NOT NULL,
  execution_url TEXT,
  workflow_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  node_name TEXT,
  error_message TEXT NOT NULL,
  error_level TEXT, -- 'warning', 'error', etc.
  error_type TEXT, -- 'NodeOperationError', etc.
  node_type TEXT, -- 'n8n-nodes-base.stopAndError', etc.
  stack_trace TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  fixed TEXT DEFAULT 'FALSE', -- Text field: 'TRUE' or 'FALSE'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workflow_errors_resolved ON workflow_errors(resolved);
CREATE INDEX IF NOT EXISTS idx_workflow_errors_fixed ON workflow_errors(fixed);
CREATE INDEX IF NOT EXISTS idx_workflow_errors_timestamp ON workflow_errors(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_errors_workflow_id ON workflow_errors(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_errors_execution_id ON workflow_errors(execution_id);

-- Enable Row Level Security (RLS)
ALTER TABLE workflow_errors ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
-- For now, we'll allow all operations with the anon key (you can restrict this later)
CREATE POLICY "Allow all operations for anon users" ON workflow_errors
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_workflow_errors_updated_at
  BEFORE UPDATE ON workflow_errors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
