# Webhook Integration Guide

This dashboard accepts errors via a webhook endpoint. You can send error data to display it in the dashboard. The webhook supports both **n8n error format** and **custom error format**.

## Webhook Endpoint

**URL:** `POST /api/webhook/errors`

**Base URL:** `http://localhost:3000/api/webhook/errors` (development)
**Production:** `https://your-domain.com/api/webhook/errors`

## Supported Formats

The webhook accepts two formats:
1. **n8n Error Format** (automatically detected and transformed)
2. **Custom Error Format** (direct WorkflowError format)

## Request Format

### n8n Error Format (Recommended)

The webhook automatically detects and transforms n8n error format:

```json
{
  "timestamp": "2025-11-28T01:06:56.210Z",
  "workflow": {
    "id": "NhNKBWAvRUJcMKAC",
    "name": "Call Count for Setters to Google sheet",
    "active": false
  },
  "execution": {
    "id": "1052067",
    "url": "https://n8n.srv1023747.hstgr.cloud/workflow/NhNKBWAvRUJcMKAC/executions/1052067",
    "error": {
      "level": "warning",
      "description": "Invalid permissions, or the requested model was not found.",
      "message": "Forbidden - perhaps check your credentials?",
      "stack": "NodeOperationError: Forbidden...",
      "node": {
        "name": "Search records in Airtable",
        "type": "n8n-nodes-base.airtableTool",
        "id": "9cfe1ea8-7175-4d19-8e90-99b8d1775b20"
      }
    },
    "lastNodeExecuted": "Format TOTAL CALLS"
  },
  "error_summary": {
    "workflow_name": "Call Count for Setters to Google sheet",
    "workflow_id": "NhNKBWAvRUJcMKAC",
    "execution_id": "1052067",
    "error_occurred_at": "2025-11-28T01:06:56.210Z"
  }
}
```

**Field Mapping:**
- `workflow.id` → `workflowId`
- `workflow.name` → `workflowName`
- `execution.error.node.name` or `execution.lastNodeExecuted` → `nodeName`
- `execution.error.message` or `execution.error.description` → `errorMessage`
- `execution.error.level` → `severity` (warning→high, error→critical, info→low)
- `execution.error.stack` → `stackTrace`
- `execution.id` → `executionId`
- `timestamp` or `error_summary.error_occurred_at` → `timestamp`

**Error Type Detection:**
The system automatically determines error type from the error message:
- Contains "timeout" → `timeout`
- Contains "connection" or "network" → `connection`
- Contains "permission" or "validation" → `validation`
- Contains "runtime" or "execution" → `runtime`
- Default → `other`

### Custom Error Format

### Single Error

```json
{
  "workflowId": "workflow-123",
  "workflowName": "Email Notification System",
  "nodeName": "HTTP Request",
  "errorMessage": "Connection timeout after 30 seconds",
  "errorType": "timeout",
  "severity": "high",
  "timestamp": "2024-01-15T10:30:00Z",
  "executionId": "exec-abc123",
  "retryCount": 2,
  "stackTrace": "Error: Connection timeout\n    at HTTPRequest (line 45)",
  "inputData": {
    "userId": 123,
    "email": "user@example.com"
  },
  "outputData": {
    "status": "error",
    "code": 500
  },
  "resolved": false
}
```

### Multiple Errors (Batch)

```json
[
  {
    "workflowId": "workflow-123",
    "workflowName": "Email Notification System",
    "nodeName": "HTTP Request",
    "errorMessage": "Connection timeout",
    "errorType": "timeout",
    "severity": "high"
  },
  {
    "workflowId": "workflow-456",
    "workflowName": "Data Sync Pipeline",
    "nodeName": "Database Query",
    "errorMessage": "Database connection failed",
    "errorType": "connection",
    "severity": "critical"
  }
]
```

## Required Fields

- `workflowId` (string): Unique identifier for the workflow
- `workflowName` (string): Human-readable workflow name
- `nodeName` (string): Name of the node where the error occurred
- `errorMessage` (string): Description of the error

## Optional Fields

- `errorType` (string): One of `"timeout"`, `"connection"`, `"validation"`, `"runtime"`, `"other"` (default: `"other"`)
- `severity` (string): One of `"critical"`, `"high"`, `"medium"`, `"low"` (default: `"medium"`)
- `timestamp` (string): ISO 8601 date string (default: current time)
- `executionId` (string): Unique execution identifier
- `retryCount` (number): Number of retry attempts (default: 0)
- `stackTrace` (string): Full stack trace
- `inputData` (object): Input data at time of error
- `outputData` (object): Output data at time of error
- `resolved` (boolean): Whether the error is resolved (default: false)
- `id` (string): Custom error ID (auto-generated if not provided)

## Response Format

### Success

```json
{
  "success": true,
  "received": 1,
  "processed": 1,
  "rejected": 0,
  "message": "Successfully processed 1 error(s)"
}
```

### Partial Success (Some Errors Rejected)

```json
{
  "success": true,
  "received": 2,
  "processed": 1,
  "rejected": 1,
  "message": "Successfully processed 1 error(s)",
  "warning": "Some errors were rejected due to validation failures",
  "rejectedErrors": [...]
}
```

### Error

```json
{
  "success": false,
  "error": "Invalid request body",
  "message": "Error details"
}
```

## Example cURL Requests

### n8n Format Example

```bash
curl -X POST http://localhost:3000/api/webhook/errors \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-11-28T01:06:56.210Z",
    "workflow": {
      "id": "NhNKBWAvRUJcMKAC",
      "name": "Call Count for Setters to Google sheet",
      "active": false
    },
    "execution": {
      "id": "1052067",
      "url": "https://n8n.srv1023747.hstgr.cloud/workflow/NhNKBWAvRUJcMKAC/executions/1052067",
      "error": {
        "level": "warning",
        "description": "Invalid permissions, or the requested model was not found.",
        "message": "Forbidden - perhaps check your credentials?",
        "stack": "NodeOperationError: Forbidden...",
        "node": {
          "name": "Search records in Airtable",
          "type": "n8n-nodes-base.airtableTool"
        }
      },
      "lastNodeExecuted": "Format TOTAL CALLS"
    },
    "error_summary": {
      "workflow_name": "Call Count for Setters to Google sheet",
      "workflow_id": "NhNKBWAvRUJcMKAC",
      "execution_id": "1052067",
      "error_occurred_at": "2025-11-28T01:06:56.210Z"
    }
  }'
```

### Custom Format Example

```bash
curl -X POST http://localhost:3000/api/webhook/errors \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "workflow-123",
    "workflowName": "Email Notification System",
    "nodeName": "HTTP Request",
    "errorMessage": "Connection timeout after 30 seconds",
    "errorType": "timeout",
    "severity": "high",
    "executionId": "exec-abc123"
  }'
```

## Example JavaScript/TypeScript

```typescript
async function sendErrorToWebhook(error: WorkflowError) {
  const response = await fetch('http://localhost:3000/api/webhook/errors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(error),
  });

  const result = await response.json();
  console.log('Webhook response:', result);
  return result;
}
```

## Example Python

```python
import requests
import json

error_data = {
    "workflowId": "workflow-123",
    "workflowName": "Email Notification System",
    "nodeName": "HTTP Request",
    "errorMessage": "Connection timeout after 30 seconds",
    "errorType": "timeout",
    "severity": "high",
    "executionId": "exec-abc123"
}

response = requests.post(
    'http://localhost:3000/api/webhook/errors',
    json=error_data,
    headers={'Content-Type': 'application/json'}
)

print(response.json())
```

## n8n Workflow Example

### Option 1: Send Full Error Object (Recommended)

In your n8n workflow error handler, add an HTTP Request node that sends the entire error object:

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/webhook/errors` (or your production URL)
3. **Headers:**
   - `Content-Type: application/json`
4. **Body:** Send the entire error object from n8n:
   ```json
   {
     "timestamp": "{{ $now.toISO() }}",
     "workflow": {
       "id": "{{ $workflow.id }}",
       "name": "{{ $workflow.name }}",
       "active": {{ $workflow.active }}
     },
     "execution": {
       "id": "{{ $execution.id }}",
       "url": "{{ $execution.resumeUrl }}",
       "error": {{ $json.error }},
       "lastNodeExecuted": "{{ $execution.lastNodeExecuted }}"
     },
     "error_summary": {
       "workflow_name": "{{ $workflow.name }}",
       "workflow_id": "{{ $workflow.id }}",
       "execution_id": "{{ $execution.id }}",
       "error_occurred_at": "{{ $now.toISO() }}"
     }
   }
   ```

### Option 2: Send Custom Format

If you prefer to send a custom format:

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/webhook/errors`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body:**
   ```json
   {
     "workflowId": "{{ $workflow.id }}",
     "workflowName": "{{ $workflow.name }}",
     "nodeName": "{{ $node.name }}",
     "errorMessage": "{{ $json.error.message }}",
     "errorType": "runtime",
     "severity": "high",
     "executionId": "{{ $execution.id }}",
     "timestamp": "{{ $now.toISO() }}"
   }
   ```

## Testing the Webhook

You can test the webhook using the provided examples or by using tools like:
- Postman
- Insomnia
- curl
- Your n8n workflow error handler

## Notes

- Errors are stored in memory (will be lost on server restart)
- Maximum of 1000 errors are kept in memory
- Errors are automatically sorted by timestamp (newest first)
- The dashboard polls for new errors every 5 seconds
- For production, consider adding authentication/authorization to the webhook endpoint

