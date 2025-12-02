import { WorkflowError } from '@/types';
import * as supabase from './supabase';

// Error store backed by Supabase
class ErrorStore {
  private cache: WorkflowError[] = [];
  private cacheTimestamp: number = 0;
  private cacheTTL: number = 5000; // 5 seconds cache
  private listeners: Set<() => void> = new Set();

  // Ensure error has all required fields
  private ensureErrorDefaults(error: WorkflowError): WorkflowError {
    return {
      id: error.id || `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      workflowId: error.workflowId,
      workflowName: error.workflowName,
      nodeName: error.nodeName,
      errorMessage: error.errorMessage,
      errorType: error.errorType || 'other',
      severity: error.severity || 'medium',
      timestamp: error.timestamp ? new Date(error.timestamp) : new Date(),
      executionId: error.executionId || `exec-${Date.now()}`,
      retryCount: error.retryCount || 0,
      stackTrace: error.stackTrace,
      inputData: error.inputData,
      outputData: error.outputData,
      resolved: error.resolved || false,
    };
  }

  // Add an error to the store
  async addError(error: WorkflowError): Promise<void> {
    const errorWithDefaults = this.ensureErrorDefaults(error);
    
    try {
      await supabase.createError(errorWithDefaults);
      // Invalidate cache
      this.cacheTimestamp = 0;
      this.notifyListeners();
    } catch (err) {
      console.error('Error adding to Supabase:', err);
      // Fallback: add to cache for immediate visibility
      this.cache.unshift(errorWithDefaults);
      if (this.cache.length > 1000) {
        this.cache = this.cache.slice(0, 1000);
    }
    this.notifyListeners();
    }
  }

  // Add multiple errors
  async addErrors(errors: WorkflowError[]): Promise<void> {
    // Process in parallel for better performance
    await Promise.all(errors.map((error) => this.addError(error)));
  }

  // Get all errors (with caching)
  async getAllErrors(): Promise<WorkflowError[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.length > 0 && (now - this.cacheTimestamp) < this.cacheTTL) {
      console.log('[ErrorStore] Returning cached data');
      return [...this.cache];
    }

    try {
      console.log('[ErrorStore] Fetching fresh data from Supabase...');
      const errors = await supabase.fetchAllErrors();
      console.log(`[ErrorStore] Fetched ${errors.length} errors from Supabase`);
      this.cache = errors;
      this.cacheTimestamp = now;
      return errors;
    } catch (err) {
      console.error('[ErrorStore] Error fetching from Supabase:', err);
      // Return cached data if available, otherwise empty array
      return this.cache.length > 0 ? [...this.cache] : [];
    }
  }

  // Get error by ID
  async getErrorById(id: string): Promise<WorkflowError | undefined> {
    const errors = await this.getAllErrors();
    return errors.find((e) => e.id === id);
  }

  // Update error (e.g., mark as resolved)
  async updateError(id: string, updates: Partial<WorkflowError>): Promise<boolean> {
    try {
      console.log('[ErrorStore] Updating error:', id, 'with updates:', updates);
      const success = await supabase.updateError(id, updates);
      console.log('[ErrorStore] Update result:', success);
      if (success) {
        // Invalidate cache immediately so next fetch gets fresh data
        this.cache = [];
        this.cacheTimestamp = 0;
    this.notifyListeners();
        console.log('[ErrorStore] Cache invalidated after successful update');
      } else {
        console.error('[ErrorStore] Supabase update returned false');
      }
      return success;
    } catch (err) {
      console.error('[ErrorStore] Error updating in Supabase:', err);
      if (err instanceof Error) {
        console.error('[ErrorStore] Error message:', err.message);
      }
      // Don't use cache fallback - we want to know if Supabase update fails
      // This ensures the user sees the real error
      return false;
    }
  }

  // Delete error
  async deleteError(id: string): Promise<boolean> {
    try {
      const success = await supabase.deleteError(id);
      if (success) {
        // Invalidate cache
        this.cacheTimestamp = 0;
        // Also remove from cache
        this.cache = this.cache.filter((e) => e.id !== id);
        this.notifyListeners();
      }
      return success;
    } catch (err) {
      console.error('Error deleting from Supabase:', err);
      // Fallback: remove from cache
      const index = this.cache.findIndex((e) => e.id === id);
      if (index !== -1) {
        this.cache.splice(index, 1);
    this.notifyListeners();
    return true;
  }
      return false;
    }
  }

  // Clear all errors (not typically used with Supabase, but kept for compatibility)
  async clearAll(): Promise<void> {
    try {
      const errors = await this.getAllErrors();
      await Promise.all(errors.map((error) => this.deleteError(error.id)));
      this.cache = [];
      this.cacheTimestamp = 0;
      this.notifyListeners();
    } catch (err) {
      console.error('Error clearing Supabase:', err);
      this.cache = [];
      this.cacheTimestamp = 0;
    this.notifyListeners();
    }
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

// Export singleton instance
export const errorStore = new ErrorStore();

