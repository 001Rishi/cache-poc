// src/cache/providers/valkey.provider.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheClient } from '../interfaces/cache-client.interface';

@Injectable()
export class ValkeyClient implements CacheClient {
  public name = 'Valkey';
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.VALKEY_URL || 'redis://localhost:6379');
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

  async del(key: string): Promise<boolean> {
    const result = await this.client.del(key);
    return result > 0;
  }

  async keys(pattern: string = '*'): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async flush(): Promise<void> {
    await this.client.flushall();
  }

  // Advanced data structures
  async hset(key: string, field: string, value: any): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  async hget(key: string, field: string): Promise<any> {
    const value = await this.client.hget(key, field);
    return value ? JSON.parse(value) : null;
  }

  async sadd(key: string, members: any[]): Promise<void> {
    const serialized = members.map((m) => JSON.stringify(m));
    await this.client.sadd(key, ...serialized);
  }

  async smembers(key: string): Promise<any[]> {
    const members = await this.client.smembers(key);
    return members.map((m) => JSON.parse(m));
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
