// src/cache/cache.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { BenchmarkService } from './benchmark/benchmark.service';
import { ValkeyClient } from './providers/valkey.provider';
import { DragonflyClient } from './providers/dragonfly.provider';
import { MemcachedClient } from './providers/memcached.provider';
import { HazelcastClient } from './providers/hazelcast.provider';
import { KeyDBClient } from './providers/keydb.provider';
import * as cacheClientInterface from './interfaces/cache-client.interface';

@Controller('cache')
export class CacheController {
  constructor(
    private readonly benchmarkService: BenchmarkService,
    private readonly valkeyClient: ValkeyClient,
    private readonly dragonflyClient: DragonflyClient,
    private readonly memcachedClient: MemcachedClient,
    private readonly hazelcastClient: HazelcastClient,
    private readonly keydbClient: KeyDBClient,
  ) {}

  @Post('benchmark')
  async runBenchmark(@Body() config: cacheClientInterface.BenchmarkConfig) {
    const clients = [
      this.valkeyClient,
      this.dragonflyClient,
      this.memcachedClient,
      this.hazelcastClient,
      this.keydbClient,
    ];

    const results: any = [];

    for (const client of clients) {
      try {
        const result = await this.benchmarkService.runBenchmark(client, config);
        results.push(result);

        // Run data structure benchmarks for Redis-compatible clients
        if (client.name !== 'Memcached') {
          const dsResults =
            await this.benchmarkService.runDataStructureBenchmark(client);
          results[results.length - 1].dataStructures = dsResults;
        }
      } catch (error) {
        console.error(`Benchmark failed for ${client.name}:`, error);
        results.push({
          service: client.name,
          error: error.message,
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      config,
      results,
    };
  }

  @Get('results')
  getResults() {
    return this.benchmarkService.getResults();
  }

  @Post('clear')
  clearCache() {
    const clients = [
      this.valkeyClient,
      this.dragonflyClient,
      this.memcachedClient,
      this.hazelcastClient,
      this.keydbClient,
    ];

    return Promise.all(
      clients.map((client) => client.flush?.().catch(() => {})),
    );
  }
}
