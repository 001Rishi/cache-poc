// src/cache/providers/hazelcast.provider.ts
import { Injectable } from '@nestjs/common';
import { CacheClient } from '../interfaces/cache-client.interface';

@Injectable()
export class HazelcastClient implements CacheClient {
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
  public name = 'Hazelcast';
  private client: any;
  private map: any;

  async initialize() {
    const { Client } = require('hazelcast-client');
    this.client = await Client.newHazelcastClient();
    this.map = await this.client.getMap('benchmark-map');
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.map.put(key, value, ttl);
  }

  async get<T = any>(key: string): Promise<T | null> {
    return await this.map.get(key);
  }

  async disconnect(): Promise<void> {
    await this.client.shutdown();
  }
}
