/**
 * Property Data Cache Service
 * Implements in-memory caching with TTL for scraped property data
 */

import type { MergedPropertyData } from '@/utils/property-data-merger';
import type { GeneratedAnalysis } from '@/services/property-analysis-ai';

interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number; // in milliseconds
  hits: number;
  url: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  oldestEntry: Date | null;
  hitRate: number;
}

class PropertyCache {
  private scrapedDataCache: Map<string, CacheEntry<MergedPropertyData>>;
  private analysisCache: Map<string, CacheEntry<GeneratedAnalysis>>;
  private stats: CacheStats;
  private maxSize: number;
  private defaultTTL: number;

  constructor() {
    this.scrapedDataCache = new Map();
    this.analysisCache = new Map();
    this.maxSize = 100; // Maximum number of entries
    this.defaultTTL = 1000 * 60 * 60; // 1 hour default TTL
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      oldestEntry: null,
      hitRate: 0
    };

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Generate cache key from URL
   */
  private generateKey(url: string): string {
    try {
      const urlObj = new URL(url);
      // Normalize URL for consistent caching
      return `${urlObj.hostname}${urlObj.pathname}`.toLowerCase().replace(/\/$/, '');
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Store scraped property data
   */
  setScrapedData(
    url: string, 
    data: MergedPropertyData, 
    ttl: number = this.defaultTTL
  ): void {
    const key = this.generateKey(url);
    
    // Check size limit
    if (this.scrapedDataCache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.scrapedDataCache.set(key, {
      data,
      timestamp: new Date(),
      ttl,
      hits: 0,
      url
    });

    this.updateStats();
  }

  /**
   * Get scraped property data
   */
  getScrapedData(url: string): MergedPropertyData | null {
    const key = this.generateKey(url);
    const entry = this.scrapedDataCache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.scrapedDataCache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Update hit count
    entry.hits++;
    this.stats.hits++;
    this.updateStats();

    return entry.data;
  }

  /**
   * Store analysis data
   */
  setAnalysis(
    url: string, 
    analysis: GeneratedAnalysis, 
    ttl: number = this.defaultTTL
  ): void {
    const key = this.generateKey(url);
    
    // Check size limit
    if (this.analysisCache.size >= this.maxSize) {
      this.evictOldestAnalysis();
    }

    this.analysisCache.set(key, {
      data: analysis,
      timestamp: new Date(),
      ttl,
      hits: 0,
      url
    });
  }

  /**
   * Get analysis data
   */
  getAnalysis(url: string): GeneratedAnalysis | null {
    const key = this.generateKey(url);
    const entry = this.analysisCache.get(key);

    if (!entry || this.isExpired(entry)) {
      return null;
    }

    entry.hits++;
    return entry.data;
  }

  /**
   * Check if entry is expired
   */
  private isExpired<T>(entry: CacheEntry<T>): boolean {
    const now = new Date().getTime();
    const entryTime = entry.timestamp.getTime();
    return now - entryTime > entry.ttl;
  }

  /**
   * Evict oldest entry from scraped data cache
   */
  private evictOldest(): void {
    let oldest: string | null = null;
    let oldestTime = new Date().getTime();

    this.scrapedDataCache.forEach((entry, key) => {
      const entryTime = entry.timestamp.getTime();
      if (entryTime < oldestTime) {
        oldestTime = entryTime;
        oldest = key;
      }
    });

    if (oldest) {
      this.scrapedDataCache.delete(oldest);
    }
  }

  /**
   * Evict oldest entry from analysis cache
   */
  private evictOldestAnalysis(): void {
    let oldest: string | null = null;
    let oldestTime = new Date().getTime();

    this.analysisCache.forEach((entry, key) => {
      const entryTime = entry.timestamp.getTime();
      if (entryTime < oldestTime) {
        oldestTime = entryTime;
        oldest = key;
      }
    });

    if (oldest) {
      this.analysisCache.delete(oldest);
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.size = this.scrapedDataCache.size + this.analysisCache.size;
    
    // Calculate hit rate
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    // Find oldest entry
    let oldest: Date | null = null;
    
    this.scrapedDataCache.forEach(entry => {
      if (!oldest || entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }
    });
    
    this.analysisCache.forEach(entry => {
      if (!oldest || entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }
    });
    
    this.stats.oldestEntry = oldest;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 1000 * 60 * 5); // Run every 5 minutes
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    let removed = 0;

    // Clean scraped data cache
    this.scrapedDataCache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        this.scrapedDataCache.delete(key);
        removed++;
      }
    });

    // Clean analysis cache
    this.analysisCache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        this.analysisCache.delete(key);
        removed++;
      }
    });

    if (removed > 0) {
      console.log(`[Cache] Cleaned up ${removed} expired entries`);
      this.updateStats();
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.scrapedDataCache.clear();
    this.analysisCache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      oldestEntry: null,
      hitRate: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Check if URL is cached
   */
  hasCachedData(url: string): boolean {
    const key = this.generateKey(url);
    const entry = this.scrapedDataCache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Get all cached URLs
   */
  getCachedUrls(): string[] {
    const urls: string[] = [];
    
    this.scrapedDataCache.forEach(entry => {
      if (!this.isExpired(entry)) {
        urls.push(entry.url);
      }
    });
    
    return urls;
  }

  /**
   * Warm cache with frequently accessed properties
   */
  async warmCache(urls: string[]): Promise<void> {
    console.log(`[Cache] Warming cache with ${urls.length} URLs`);
    
    for (const url of urls) {
      if (!this.hasCachedData(url)) {
        // In a real implementation, this would fetch the data
        // For now, we just log it
        console.log(`[Cache] Would fetch: ${url}`);
      }
    }
  }

  /**
   * Export cache for persistence
   */
  exportCache(): string {
    const data = {
      scrapedData: Array.from(this.scrapedDataCache.entries()),
      analysis: Array.from(this.analysisCache.entries()),
      stats: this.stats,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(data);
  }

  /**
   * Import cache from persistence
   */
  importCache(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      // Restore scraped data
      if (parsed.scrapedData) {
        this.scrapedDataCache = new Map(parsed.scrapedData);
      }
      
      // Restore analysis
      if (parsed.analysis) {
        this.analysisCache = new Map(parsed.analysis);
      }
      
      // Restore stats
      if (parsed.stats) {
        this.stats = parsed.stats;
      }
      
      console.log(`[Cache] Imported cache with ${this.stats.size} entries`);
    } catch (error) {
      console.error('[Cache] Failed to import cache:', error);
    }
  }
}

// Export singleton instance
export const propertyCache = new PropertyCache();

// Export types
export type { CacheStats };