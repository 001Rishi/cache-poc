// src/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { BenchmarkService } from './benchmark/benchmark.service';
import { ValkeyClient } from './providers/valkey.provider';
import { DragonflyClient } from './providers/dragonfly.provider';
import { MemcachedClient } from './providers/memcached.provider';
import { HazelcastClient } from './providers/hazelcast.provider';
import { KeyDBClient } from './providers/keydb.provider';
import { CacheController } from './cache.controller';

@Module({
  providers: [
    BenchmarkService,
    ValkeyClient,
    DragonflyClient,
    MemcachedClient,
    HazelcastClient,
    KeyDBClient,
  ],
  controllers: [CacheController],
  exports: [BenchmarkService],
})
export class CacheModule {}
