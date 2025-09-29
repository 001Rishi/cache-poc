export interface CacheClient {
  name: string;

  set(key: string, value: any, ttl?: number): Promise<void>;
  get<T = any>(key: string): Promise<T | null>;
  del(key: string): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
  flush(): Promise<void>;

  // Advanced features
  hset?(key: string, field: string, value: any): Promise<void>;
  hget?(key: string, field: string): Promise<any>;
  sadd?(key: string, members: any[]): Promise<void>;
  smembers?(key: string): Promise<any[]>;

  disconnect(): Promise<void>;
}

export interface BenchmarkResult {
  service: string;
  throughput: {
    operationsPerSecond: number;
    readOps: number;
    writeOps: number;
  };
  latency: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
    max: number;
  };
  memoryUsage: number;
  successRate: number;
  errors: number;
}

export interface BenchmarkConfig {
  operations: number;
  keySize: number;
  valueSize: number;
  dataTypes: ('string' | 'hash' | 'set')[];
  concurrentClients: number;
}
