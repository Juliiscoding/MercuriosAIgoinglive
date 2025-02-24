import NodeCache from 'node-cache'

interface CacheConfig {
  stdTTL: number // Time to live in seconds
  checkperiod: number // Time in seconds to check for expired keys
}

export class CacheService {
  private static instance: CacheService
  private cache: NodeCache
  private readonly DEFAULT_TTL = 3600 // 1 hour
  private readonly CACHE_CHECK_PERIOD = 600 // 10 minutes

  private constructor(config?: CacheConfig) {
    this.cache = new NodeCache({
      stdTTL: config?.stdTTL || this.DEFAULT_TTL,
      checkperiod: config?.checkperiod || this.CACHE_CHECK_PERIOD,
    })
  }

  public static getInstance(config?: CacheConfig): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config)
    }
    return CacheService.instance
  }

  // Set data in cache
  public set<T>(key: string, data: T, ttl?: number): boolean {
    return this.cache.set(key, data, ttl)
  }

  // Get data from cache
  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key)
  }

  // Delete data from cache
  public del(key: string | string[]): number {
    return this.cache.del(key)
  }

  // Clear all cache
  public flush(): void {
    this.cache.flushAll()
  }

  // Get cache stats
  public getStats() {
    return this.cache.getStats()
  }

  // Check if key exists
  public has(key: string): boolean {
    return this.cache.has(key)
  }

  // Get multiple items
  public mget<T>(keys: string[]): { [key: string]: T } {
    return this.cache.mget<T>(keys)
  }

  // Set multiple items
  public mset<T>(keyValuePairs: { key: string; val: T; ttl?: number }[]): boolean {
    return this.cache.mset(keyValuePairs)
  }

  // Get keys
  public keys(): string[] {
    return this.cache.keys()
  }

  // Get TTL
  public getTtl(key: string): number | undefined {
    return this.cache.getTtl(key)
  }

  // Set TTL
  public setTtl(key: string, ttl: number): boolean {
    return this.cache.ttl(key, ttl)
  }
}
