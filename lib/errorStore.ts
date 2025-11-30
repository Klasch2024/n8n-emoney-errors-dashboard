import { WorkflowError } from '@/types';

// In-memory store for errors
// In production, replace this with a database (PostgreSQL, MongoDB, etc.)
class ErrorStore {
  private errors: WorkflowError[] = [];
  private listeners: Set<() => void> = new Set();

  // Add an error to the store
  addError(error: WorkflowError): void {
    // Ensure the error has all required fields
    const errorWithDefaults: WorkflowError = {
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

    // Add to beginning of array (most recent first)
    this.errors.unshift(errorWithDefaults);
    
    // Keep only last 1000 errors to prevent memory issues
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(0, 1000);
    }

    // Notify listeners
    this.notifyListeners();
  }

  // Add multiple errors
  addErrors(errors: WorkflowError[]): void {
    errors.forEach((error) => this.addError(error));
  }

  // Get all errors
  getAllErrors(): WorkflowError[] {
    return [...this.errors];
  }

  // Get error by ID
  getErrorById(id: string): WorkflowError | undefined {
    return this.errors.find((e) => e.id === id);
  }

  // Update error (e.g., mark as resolved)
  updateError(id: string, updates: Partial<WorkflowError>): boolean {
    const index = this.errors.findIndex((e) => e.id === id);
    if (index === -1) return false;

    this.errors[index] = { ...this.errors[index], ...updates };
    this.notifyListeners();
    return true;
  }

  // Delete error
  deleteError(id: string): boolean {
    const index = this.errors.findIndex((e) => e.id === id);
    if (index === -1) return false;

    this.errors.splice(index, 1);
    this.notifyListeners();
    return true;
  }

  // Clear all errors
  clearAll(): void {
    this.errors = [];
    this.notifyListeners();
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

