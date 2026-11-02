import { pool } from '../src/adapters/postgres.js';
import { config } from '../src/config.js';

// usage: npm run load -- [total] [concurrency]
const total = Number(process.argv[2] ?? 5000);
const concurrency = Number(process.argv[3] ?? 100);
const unique = Math.ceil(total / 2);
const run = `load-${Date.now().toString(36)}`;
const url = `http://localhost:${config.port}/events/comment`;

try {
  await fetch(`http://localhost:${config.port}/health`);
} catch {
  console.error(`API not reachable on port ${config.port}; start it with "npm run dev:http" (and the worker with "npm run dev:worker")`);
  await pool.end();
  process.exit(1);
}

// every comment is sent twice, shuffled so some repeats arrive together and some far apart
const ids = [...Array(unique).keys(), ...Array(unique).keys()].slice(0, total);
for (let i = ids.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [ids[i], ids[j]] = [ids[j], ids[i]];
}

const statuses: Record<number, number> = {};
const latencies: number[] = [];
let next = 0;

async function sender() {
  while (next < ids.length) {
    const id = ids[next++];
    const started = performance.now();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        externalCommentId: `${run}-${id}`,
        externalPostId: `${run}-post-${id % 10}`,
        text: `simulated comment ${id}`,
        commentedAt: new Date().toISOString(),
      }),
    });
    await res.arrayBuffer();
    latencies.push(performance.now() - started);
    statuses[res.status] = (statuses[res.status] ?? 0) + 1;
  }
}

const started = performance.now();
await Promise.all(Array.from({ length: concurrency }, sender));
const seconds = (performance.now() - started) / 1000;

latencies.sort((a, b) => a - b);
const percentile = (p: number) => latencies[Math.floor(latencies.length * p)].toFixed(1);
console.log(`sent ${total} events (${unique} unique) with ${concurrency} concurrent senders`);
console.log(`statuses ${JSON.stringify(statuses)}, ${Math.round(total / seconds)} req/s, p50 ${percentile(0.5)} ms, p99 ${percentile(0.99)} ms`);

// wait for the worker to drain the queue, then check one row per unique comment
const countRows = async () =>
  Number((await pool.query('select count(*) from comments where external_comment_id like $1', [`${run}-%`])).rows[0].count);

let rows = await countRows();
for (let waited = 0; rows < unique && waited < 30_000; waited += 500) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  rows = await countRows();
}
await pool.end();

console.log(`rows in postgres: ${rows}, expected ${unique}, run id ${run}`);
if (rows !== unique) process.exitCode = 1;
