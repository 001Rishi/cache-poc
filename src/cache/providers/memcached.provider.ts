// src/cache/providers/memcached.provider.ts
import { Injectable } from '@nestjs/common';
import { CacheClient } from '../interfaces/cache-client.interface';

@Injectable()
export class MemcachedClient implements CacheClient {
  public name = 'Memcached';
  private client: any;

  constructor() {
    const Memcached = require('memcached');
    this.client = new Memcached(process.env.MEMCACHED_URL || 'localhost:11211');
  }
  del(key: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  keys(pattern?: string): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  flush(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  hset?(key: string, field: string, value: any): Promise<void> {
    throw new Error('Method not implemented.');
  }
  hget?(key: string, field: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  sadd?(key: string, members: any[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  smembers?(key: string): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  set(key: string, value: any, ttl?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, ttl || 0, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  get<T = any>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err: any, data: any) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  // Memcached doesn't support complex data structures natively
  async disconnect(): Promise<void> {
    this.client.end();
  }
}
