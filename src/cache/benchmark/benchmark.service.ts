// src/cache/benchmark/benchmark.service.ts
import { Injectable } from '@nestjs/common';
import {
  BenchmarkResult,
  BenchmarkConfig,
  CacheClient,
} from '../interfaces/cache-client.interface';

@Injectable()
export class BenchmarkService {
  private results: BenchmarkResult[] = [];

  async runBenchmark(
    client: CacheClient,
    config: BenchmarkConfig,
  ): Promise<BenchmarkResult> {
    const latencies: number[] = [];
    let errors = 0;
    let successfulOps = 0;

    const startTime = process.hrtime.bigint();

    // Write operations benchmark
    for (let i = 0; i < config.operations; i++) {
      const key = `key-${i}`.padEnd(config.keySize, 'x');
      const value = {
        data: 'x'.repeat(config.valueSize),
        timestamp: Date.now(),
        index: i,
      };

      const operationStart = process.hrtime.bigint();

      try {
        await client.set(key, value, 3600);
        successfulOps++;
      } catch (error) {
        errors++;
        continue;
      } finally {
        const operationEnd = process.hrtime.bigint();
        const latency = Number(operationEnd - operationStart) / 1_000_000; // Convert to milliseconds
        latencies.push(latency);
      }
    }

    // Read operations benchmark
    for (let i = 0; i < config.operations; i++) {
      const key = `key-${i}`.padEnd(config.keySize, 'x');

      const operationStart = process.hrtime.bigint();

      try {
        await client.get(key);
        successfulOps++;
      } catch (error) {
        errors++;
        continue;
      } finally {
        const operationEnd = process.hrtime.bigint();
        const latency = Number(operationEnd - operationStart) / 1_000_000;
        latencies.push(latency);
      }
    }

    const endTime = process.hrtime.bigint();
    const totalTime = Number(endTime - startTime) / 1_000_000_000; // Convert to seconds

    // Calculate percentiles
    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)];
    const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)];
    const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)];

    const result: BenchmarkResult = {
      service: client.name,
      throughput: {
        operationsPerSecond: successfulOps / totalTime,
        readOps: config.operations / totalTime,
        writeOps: config.operations / totalTime,
      },
      latency: {
        average: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        p50,
        p95,
        p99,
        max: sortedLatencies[sortedLatencies.length - 1],
      },
      memoryUsage: await this.getMemoryUsage(client),
      successRate: (successfulOps / (config.operations * 2)) * 100,
      errors,
    };

    this.results.push(result);
    return result;
  }

  private async getMemoryUsage(client: CacheClient): Promise<number> {
    // This would be implementation-specific for each cache service
    // For Redis-compatible, we can use INFO memory command
    if (
      'client' in client &&
      typeof (client as any).client.info === 'function'
    ) {
      try {
        const info = await (client as any).client.info('memory');
        const usedMemoryMatch = info.match(/used_memory:(\d+)/);
        return usedMemoryMatch ? parseInt(usedMemoryMatch[1]) : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  async runDataStructureBenchmark(client: CacheClient): Promise<any> {
    const results = {};

    // Hash operations benchmark
    if (client.hset && client.hget) {
      const hashStart = process.hrtime.bigint();
      for (let i = 0; i < 1000; i++) {
        await client.hset('test-hash', `field-${i}`, { value: i });
      }
      const hashEnd = process.hrtime.bigint();
      results['hashOperations'] = Number(hashEnd - hashStart) / 1_000_000;
    }

    // Set operations benchmark
    if (client.sadd && client.smembers) {
      const setStart = process.hrtime.bigint();
      await client.sadd(
        'test-set',
        Array.from({ length: 1000 }, (_, i) => i),
      );
      const setEnd = process.hrtime.bigint();
      results['setOperations'] = Number(setEnd - setStart) / 1_000_000;
    }

    return results;
  }

  getResults(): BenchmarkResult[] {
    return this.results;
  }

  clearResults(): void {
    this.results = [];
  }
}
