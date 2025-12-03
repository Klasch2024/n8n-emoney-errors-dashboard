// Close CRM API Service

const CLOSE_API_KEY = process.env.CLOSE_API_KEY || '';
const CLOSE_BASE_URL = 'https://api.close.com/api/v1';

export interface CloseCustomField {
  id: string;
  name: string;
  type: string;
  accepts_multiple_values?: boolean;
  editable_by?: string[];
  required?: boolean;
  choices?: string[];
  converting_to_type?: string;
}

export async function fetchLeadCustomFields(): Promise<CloseCustomField[]> {
  if (!CLOSE_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Close] ❌ CLOSE_API_KEY is not configured');
    }
    throw new Error('Close API key is not configured');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Close] Fetching lead custom fields from:', `${CLOSE_BASE_URL}/custom_field/lead/`);
  }

  try {
    // Close CRM uses Basic Auth with API key as username and empty password
    const authString = Buffer.from(`${CLOSE_API_KEY}:`).toString('base64');
    
    const response = await fetch(`${CLOSE_BASE_URL}/custom_field/lead/`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[Close] Response status:', response.status, response.statusText);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV === 'development') {
        console.error('[Close] ❌ Error fetching custom fields:', response.status);
        console.error('[Close] Error response:', errorText);
      }
      throw new Error(`Failed to fetch custom fields: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    if (process.env.NODE_ENV === 'development') {
      console.log('[Close] Response data type:', typeof data);
      console.log('[Close] Response keys:', Object.keys(data || {}));
    }
    
    // Close CRM API returns data in a "data" array
    let customFields: CloseCustomField[] = [];
    if (data && Array.isArray(data.data)) {
      customFields = data.data;
    } else if (Array.isArray(data)) {
      customFields = data;
    } else if (data && Array.isArray(data.results)) {
      customFields = data.results;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Close] ✅ Fetched ${customFields.length} custom fields`);
      if (customFields.length > 0) {
        console.log('[Close] First custom field:', {
          id: customFields[0].id,
          name: customFields[0].name,
          type: customFields[0].type,
        });
      }
    }
    
    return customFields;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Close] ❌ Error in fetchLeadCustomFields:', error);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error fetching custom fields');
  }
}

export async function fetchOpportunityCustomFields(): Promise<CloseCustomField[]> {
  if (!CLOSE_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Close] ❌ CLOSE_API_KEY is not configured');
    }
    throw new Error('Close API key is not configured');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Close] Fetching opportunity custom fields from:', `${CLOSE_BASE_URL}/custom_field/opportunity/`);
  }

  try {
    // Close CRM uses Basic Auth with API key as username and empty password
    const authString = Buffer.from(`${CLOSE_API_KEY}:`).toString('base64');
    
    const response = await fetch(`${CLOSE_BASE_URL}/custom_field/opportunity/`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[Close] Response status:', response.status, response.statusText);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV === 'development') {
        console.error('[Close] ❌ Error fetching custom fields:', response.status);
        console.error('[Close] Error response:', errorText);
      }
      throw new Error(`Failed to fetch custom fields: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    if (process.env.NODE_ENV === 'development') {
      console.log('[Close] Response data type:', typeof data);
      console.log('[Close] Response keys:', Object.keys(data || {}));
    }
    
    // Close CRM API returns data in a "data" array
    let customFields: CloseCustomField[] = [];
    if (data && Array.isArray(data.data)) {
      customFields = data.data;
    } else if (Array.isArray(data)) {
      customFields = data;
    } else if (data && Array.isArray(data.results)) {
      customFields = data.results;
    }

    console.log(`[Close] ✅ Fetched ${customFields.length} opportunity custom fields`);
    
    if (customFields.length > 0) {
      console.log('[Close] First opportunity custom field:', {
        id: customFields[0].id,
        name: customFields[0].name,
        type: customFields[0].type,
      });
    }
    
    return customFields;
  } catch (error) {
    console.error('[Close] ❌ Error in fetchOpportunityCustomFields:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error fetching custom fields');
  }
}

export interface CloseUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  image?: string;
  role_id?: string;
  role_name?: string;
  [key: string]: any; // For any additional fields
}

export async function fetchUsers(): Promise<CloseUser[]> {
  if (!CLOSE_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Close] ❌ CLOSE_API_KEY is not configured');
    }
    throw new Error('Close API key is not configured');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Close] Fetching users from:', `${CLOSE_BASE_URL}/user/`);
  }

  try {
    // Close CRM uses Basic Auth with API key as username and empty password
    const authString = Buffer.from(`${CLOSE_API_KEY}:`).toString('base64');
    
    const response = await fetch(`${CLOSE_BASE_URL}/user/`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[Close] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Close] ❌ Error fetching users:', response.status);
      console.error('[Close] Error response:', errorText);
      throw new Error(`Failed to fetch users: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[Close] Response data type:', typeof data);
    console.log('[Close] Response keys:', Object.keys(data || {}));
    
    // Close CRM API returns data in a "data" array
    let users: CloseUser[] = [];
    if (data && Array.isArray(data.data)) {
      users = data.data;
    } else if (Array.isArray(data)) {
      users = data;
    } else if (data && Array.isArray(data.results)) {
      users = data.results;
    }

    console.log(`[Close] ✅ Fetched ${users.length} users`);
    
    if (users.length > 0) {
      console.log('[Close] First user:', {
        id: users[0].id,
        email: users[0].email,
        name: users[0].name || `${users[0].first_name} ${users[0].last_name}`,
      });
    }
    
    return users;
  } catch (error) {
    console.error('[Close] ❌ Error in fetchUsers:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error fetching users');
  }
}

export interface CloseLeadStatus {
  id: string;
  label: string;
  type?: string;
  organization_id?: string;
  [key: string]: any; // For any additional fields
}

export async function fetchLeadStatuses(): Promise<CloseLeadStatus[]> {
  if (!CLOSE_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Close] ❌ CLOSE_API_KEY is not configured');
    }
    throw new Error('Close API key is not configured');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Close] Fetching lead statuses from:', `${CLOSE_BASE_URL}/status/lead/`);
  }

  try {
    // Close CRM uses Basic Auth with API key as username and empty password
    const authString = Buffer.from(`${CLOSE_API_KEY}:`).toString('base64');
    
    const response = await fetch(`${CLOSE_BASE_URL}/status/lead/`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[Close] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Close] ❌ Error fetching lead statuses:', response.status);
      console.error('[Close] Error response:', errorText);
      throw new Error(`Failed to fetch lead statuses: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[Close] Response data type:', typeof data);
    console.log('[Close] Response keys:', Object.keys(data || {}));
    
    // Close CRM API returns data in a "data" array
    let statuses: CloseLeadStatus[] = [];
    if (data && Array.isArray(data.data)) {
      statuses = data.data;
    } else if (Array.isArray(data)) {
      statuses = data;
    } else if (data && Array.isArray(data.results)) {
      statuses = data.results;
    }

    console.log(`[Close] ✅ Fetched ${statuses.length} lead statuses`);
    
    if (statuses.length > 0) {
      console.log('[Close] First lead status:', {
        id: statuses[0].id,
        label: statuses[0].label,
        type: statuses[0].type,
      });
    }
    
    return statuses;
  } catch (error) {
    console.error('[Close] ❌ Error in fetchLeadStatuses:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error fetching lead statuses');
  }
}

export interface CloseOpportunityStatus {
  id: string;
  label: string;
  type?: string;
  organization_id?: string;
  [key: string]: any; // For any additional fields
}

export async function fetchOpportunityStatuses(): Promise<CloseOpportunityStatus[]> {
  if (!CLOSE_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Close] ❌ CLOSE_API_KEY is not configured');
    }
    throw new Error('Close API key is not configured');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Close] Fetching opportunity statuses from:', `${CLOSE_BASE_URL}/status/opportunity/`);
  }

  try {
    // Close CRM uses Basic Auth with API key as username and empty password
    const authString = Buffer.from(`${CLOSE_API_KEY}:`).toString('base64');
    
    const response = await fetch(`${CLOSE_BASE_URL}/status/opportunity/`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[Close] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Close] ❌ Error fetching opportunity statuses:', response.status);
      console.error('[Close] Error response:', errorText);
      throw new Error(`Failed to fetch opportunity statuses: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[Close] Response data type:', typeof data);
    console.log('[Close] Response keys:', Object.keys(data || {}));
    
    // Close CRM API returns data in a "data" array
    let statuses: CloseOpportunityStatus[] = [];
    if (data && Array.isArray(data.data)) {
      statuses = data.data;
    } else if (Array.isArray(data)) {
      statuses = data;
    } else if (data && Array.isArray(data.results)) {
      statuses = data.results;
    }

    console.log(`[Close] ✅ Fetched ${statuses.length} opportunity statuses`);
    
    if (statuses.length > 0) {
      console.log('[Close] First opportunity status:', {
        id: statuses[0].id,
        label: statuses[0].label,
        type: statuses[0].type,
      });
    }
    
    return statuses;
  } catch (error) {
    console.error('[Close] ❌ Error in fetchOpportunityStatuses:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error fetching opportunity statuses');
  }
}

