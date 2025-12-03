const N8N_API_KEY = process.env.N8N_API_KEY || '';
const N8N_BASE_URL = process.env.N8N_BASE_URL || '';

if (!N8N_API_KEY && process.env.NODE_ENV === 'development') {
  console.warn('[N8N] ⚠️ API key not configured. Some features may not work.');
}

export interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings?: any;
  staticData?: any;
  tags?: Array<{ id: string; name: string }>;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all workflows from n8n
export async function fetchAllWorkflows(): Promise<N8NWorkflow[]> {
  console.log('[N8N] ========== FETCH WORKFLOWS CALLED ==========');
  console.log('[N8N] API_KEY exists:', !!N8N_API_KEY);
  console.log('[N8N] BASE_URL:', N8N_BASE_URL);
  
  if (!N8N_API_KEY || !N8N_BASE_URL) {
    console.warn('[N8N] ⚠️ API not configured, returning empty array');
    console.warn('[N8N] API_KEY:', N8N_API_KEY ? 'SET' : 'MISSING');
    console.warn('[N8N] BASE_URL:', N8N_BASE_URL || 'MISSING');
    return [];
  }

  try {
    const allWorkflows: N8NWorkflow[] = [];
    let limit = 250; // Maximum limit per page (n8n allows up to 250)
    let cursor: string | null = null;
    let hasMore = true;
    let pageCount = 0;

    while (hasMore) {
      pageCount++;
      let url = `${N8N_BASE_URL}/api/v1/workflows?limit=${limit}`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }
      if (process.env.NODE_ENV === 'development') {
        console.log(`[N8N] Fetching page ${pageCount} from:`, url);
        console.log(`[N8N] Cursor: ${cursor || 'none'}, Limit: ${limit}`);
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      console.log('[N8N] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[N8N] ❌ Error fetching workflows:', response.status);
        console.error('[N8N] Error response:', errorText);
        throw new Error(`Failed to fetch workflows: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log(`[N8N] Page ${pageCount} response data type:`, typeof data);
      }
      
      // Handle different response formats
      let workflows: N8NWorkflow[] = [];
      let nextCursor: string | null = null;
      
      if (Array.isArray(data)) {
        // Direct array response
        workflows = data;
      } else if (data && Array.isArray(data.data)) {
        // Response with data array
        workflows = data.data;
        nextCursor = data.nextCursor || data.cursor || null;
      } else if (data && Array.isArray(data.workflows)) {
        // Response with workflows array
        workflows = data.workflows;
        nextCursor = data.nextCursor || data.cursor || null;
      } else if (data && data.workflow) {
        // Single workflow
        workflows = [data.workflow];
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[N8N] Page ${pageCount}: Fetched ${workflows.length} workflows`);
        console.log(`[N8N] Next cursor:`, nextCursor);
      }
      
      if (workflows.length > 0) {
        allWorkflows.push(...workflows);
      }
      
      // Check if there's a next page
      if (nextCursor) {
        cursor = nextCursor;
        if (process.env.NODE_ENV === 'development') {
          console.log('[N8N] More pages available, continuing...');
        }
      } else {
        // No more pages
        hasMore = false;
        if (process.env.NODE_ENV === 'development') {
          console.log('[N8N] No more pages (no nextCursor)');
        }
      }
      
      // Safety check to prevent infinite loops
      if (pageCount > 100) {
        console.warn('[N8N] ⚠️ Reached maximum page limit (100), stopping pagination');
        hasMore = false;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[N8N] ✅ Total fetched: ${allWorkflows.length} workflows across ${pageCount} page(s)`);
      if (allWorkflows.length > 0) {
        const activeCount = allWorkflows.filter(w => w.active).length;
        console.log('[N8N] Active workflows:', activeCount);
        console.log('[N8N] Inactive workflows:', allWorkflows.length - activeCount);
        console.log('[N8N] First workflow:', {
          id: allWorkflows[0].id,
          name: allWorkflows[0].name,
          active: allWorkflows[0].active,
        });
      }
    }
    
    return allWorkflows;
  } catch (error) {
    console.error('[N8N] ❌❌❌ Exception fetching workflows:', error);
    if (error instanceof Error) {
      console.error('[N8N] Error message:', error.message);
      console.error('[N8N] Error stack:', error.stack);
    }
    throw error;
  }
}

// Fetch a single workflow by ID
export async function fetchWorkflowById(id: string): Promise<N8NWorkflow | null> {
  if (!N8N_API_KEY || !N8N_BASE_URL) {
    console.warn('[N8N] API not configured');
    return null;
  }

  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${id}`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[N8N] Error fetching workflow:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[N8N] Exception fetching workflow:', error);
    return null;
  }
}

