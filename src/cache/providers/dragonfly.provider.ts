// src/cache/providers/dragonfly.provider.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheClient } from '../interfaces/cache-client.interface';

@Injectable()
export class DragonflyClient implements CacheClient {
  public name = 'Dragonfly DB';
  private client: Redis;

  constructor() {
    this.client = new Redis(
      process.env.DRAGONFLY_URL || 'redis://localhost:6381',
    );
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

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
