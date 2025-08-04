interface QueueItem<T> {
  id: string;
  data: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  retries: number;
}

interface QueueOptions {
  concurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
  onProgress?: (completed: number, total: number, current?: any) => void;
  onItemComplete?: (item: any, result: any) => void;
  onItemError?: (item: any, error: Error) => void;
}

export class BatchProcessingQueue<T> {
  private queue: QueueItem<T>[] = [];
  private processing: Map<string, QueueItem<T>> = new Map();
  private completed: Map<string, QueueItem<T>> = new Map();
  private failed: Map<string, QueueItem<T>> = new Map();
  private options: Required<QueueOptions>;
  private processor: (item: T) => Promise<any>;
  private isRunning = false;

  constructor(
    processor: (item: T) => Promise<any>,
    options: QueueOptions = {}
  ) {
    this.processor = processor;
    this.options = {
      concurrency: options.concurrency || 3,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000,
      onProgress: options.onProgress || (() => {}),
      onItemComplete: options.onItemComplete || (() => {}),
      onItemError: options.onItemError || (() => {})
    };
  }

  add(items: T | T[]): void {
    const itemsArray = Array.isArray(items) ? items : [items];
    
    for (const item of itemsArray) {
      const queueItem: QueueItem<T> = {
        id: `item-${Date.now()}-${Math.random()}`,
        data: item,
        status: 'pending',
        retries: 0
      };
      this.queue.push(queueItem);
    }
  }

  async start(): Promise<Map<string, any>> {
    if (this.isRunning) {
      throw new Error('Queue is already running');
    }

    this.isRunning = true;
    const results = new Map<string, any>();

    while (this.queue.length > 0 || this.processing.size > 0) {
      // Start new items up to concurrency limit
      while (this.processing.size < this.options.concurrency && this.queue.length > 0) {
        const item = this.queue.shift()!;
        this.processItem(item);
      }

      // Wait for at least one item to complete
      if (this.processing.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Report progress
      const total = this.queue.length + this.processing.size + this.completed.size + this.failed.size;
      const completedCount = this.completed.size + this.failed.size;
      this.options.onProgress(completedCount, total);
    }

    // Collect results
    for (const [id, item] of this.completed) {
      results.set(id, item.result);
    }

    this.isRunning = false;
    return results;
  }

  private async processItem(item: QueueItem<T>): Promise<void> {
    item.status = 'processing';
    this.processing.set(item.id, item);

    try {
      const result = await this.processor(item.data);
      
      item.status = 'completed';
      item.result = result;
      this.processing.delete(item.id);
      this.completed.set(item.id, item);
      
      this.options.onItemComplete(item.data, result);
    } catch (error) {
      item.retries++;
      
      if (item.retries < this.options.retryAttempts) {
        // Retry with exponential backoff
        const delay = this.options.retryDelay * Math.pow(2, item.retries - 1);
        setTimeout(() => {
          item.status = 'pending';
          this.processing.delete(item.id);
          this.queue.push(item);
        }, delay);
      } else {
        // Max retries reached
        item.status = 'failed';
        item.error = error instanceof Error ? error.message : 'Unknown error';
        this.processing.delete(item.id);
        this.failed.set(item.id, item);
        
        this.options.onItemError(item.data, error as Error);
      }
    }
  }

  getStatus(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  } {
    return {
      pending: this.queue.length,
      processing: this.processing.size,
      completed: this.completed.size,
      failed: this.failed.size,
      total: this.queue.length + this.processing.size + this.completed.size + this.failed.size
    };
  }

  getResults(): Array<{ data: T; result?: any; error?: string }> {
    const results: Array<{ data: T; result?: any; error?: string }> = [];
    
    for (const item of this.completed.values()) {
      results.push({ data: item.data, result: item.result });
    }
    
    for (const item of this.failed.values()) {
      results.push({ data: item.data, error: item.error });
    }
    
    return results;
  }

  stop(): void {
    this.isRunning = false;
  }

  clear(): void {
    this.queue = [];
    this.processing.clear();
    this.completed.clear();
    this.failed.clear();
    this.isRunning = false;
  }
}

// Helper function for rate-limited batch processing
export async function processBatchWithRateLimit<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    delayBetweenBatches?: number;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<Map<T, R>> {
  const { 
    batchSize = 5, 
    delayBetweenBatches = 1000,
    onProgress 
  } = options;
  
  const results = new Map<T, R>();
  let processed = 0;
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(item => processor(item))
    );
    
    // Store results
    batch.forEach((item, index) => {
      const result = batchResults[index];
      if (result.status === 'fulfilled') {
        results.set(item, result.value);
      }
    });
    
    processed += batch.length;
    if (onProgress) {
      onProgress(processed, items.length);
    }
    
    // Delay between batches (except for the last batch)
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}