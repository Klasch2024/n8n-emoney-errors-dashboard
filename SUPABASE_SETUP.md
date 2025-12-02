# Supabase Integration Setup

This dashboard is now connected to Supabase for persistent error storage.

## Environment Variables

Update your `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zdcevpdampwgxdzlnymu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY2V2cGRhbXB3Z3hkemxueW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjAxNDUsImV4cCI6MjA2ODc5NjE0NX0.VmKEcyulTQDZjegC1Rdn8QFhsNL-m7t7xbsdoJCkes8
```

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase-schema.sql` to create the table and indexes

The SQL script will:
- Create the `workflow_errors` table with all required fields
- Set up indexes for better query performance
- Enable Row Level Security (RLS) with a policy that allows all operations
- Create a trigger to automatically update the `updated_at` timestamp

## Table Structure

The `workflow_errors` table has the following columns:

- `id` (UUID, Primary Key) - Auto-generated unique identifier
- `error_id` (TEXT, Unique) - Custom error ID from n8n
- `workflow_id` (TEXT) - ID of the workflow
- `workflow_name` (TEXT, Required) - Name of the workflow
- `node_name` (TEXT) - Name of the node where error occurred
- `error_message` (TEXT, Required) - The error message
- `error_type` (TEXT) - Type of error: 'timeout', 'connection', 'validation', 'runtime', 'other'
- `severity` (TEXT) - Severity level: 'critical', 'high', 'medium', 'low'
- `timestamp` (TIMESTAMPTZ, Required) - When the error occurred
- `execution_id` (TEXT) - ID of the execution
- `execution_url` (TEXT) - URL to the execution details
- `retry_count` (INTEGER) - Number of retry attempts
- `resolved` (BOOLEAN) - Whether the error is resolved
- `fixed` (TEXT) - Text field: 'TRUE' or 'FALSE' (used for filtering)
- `stack_trace` (TEXT) - Error stack trace
- `input_data` (JSONB) - Input data as JSON
- `output_data` (JSONB) - Output data as JSON
- `created_at` (TIMESTAMPTZ) - When the record was created
- `updated_at` (TIMESTAMPTZ) - When the record was last updated

## Security

The RLS policy currently allows all operations for anonymous users. For production, you should:
1. Restrict the policy to authenticated users only
2. Add more granular permissions based on user roles
3. Consider using service role key for server-side operations

