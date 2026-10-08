import assert from 'node:assert/strict';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

if (process.platform === 'win32') {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const profile = await mkdtemp(join(root, '.shopee-duplicate-test-'));
  const instances = Array.from({ length: 8 }, () => {
    const client = new Client({ name: 'duplicate-browser-regression', version: '1.0.0' });
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [
        '--import',
        'tsx',
        '--import',
        new URL('./fixtures/mock-browser.mjs', import.meta.url).href,
        process.argv[2] ?? fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      ],
      cwd: root,
      env: { SHOPEE_PROFILE_DIR: profile, SHOPEE_ACCOUNT_TOOLS: 'auto', DEBUG: 'false' },
      stderr: 'pipe',
    });
    const instance = { client, transport, stderr: '' };
    transport.stderr?.on('data', (chunk: Buffer) => {
      instance.stderr += chunk.toString();
    });
    return instance;
  });
  try {
    await Promise.all(
      instances.map(({ client, transport }) => client.connect(transport, { timeout: 10000 })),
    );
    const results = await Promise.all(
      instances.map(({ client }) => client.callTool({ name: 'check_login_status', arguments: {} })),
    );
    const owners = results.flatMap((result, index) =>
      JSON.stringify(result.content).includes('✅ Logged in') ? [index] : [],
    );
    assert.equal(
      owners.length,
      1,
      `Only one of eight processes may launch the browser: ${JSON.stringify(results)}`,
    );
    for (const [index, instance] of instances.entries()) {
      assert.equal(
        (instance.stderr.match(/TEST_BROWSER_LAUNCH/g) ?? []).length,
        index === owners[0] ? 1 : 0,
      );
      if (index !== owners[0])
        assert.match(JSON.stringify(results[index].content), /profile is already in use/i);
    }

    // Concurrent tool calls in the owning process must also reuse one context.
    const owner = instances[owners[0]];
    await Promise.all(
      Array.from({ length: 8 }, () =>
        owner.client.callTool({ name: 'check_login_status', arguments: {} }),
      ),
    );
    assert.equal((owner.stderr.match(/TEST_BROWSER_LAUNCH/g) ?? []).length, 1);
    await owner.client.close();
    await owner.transport.close();

    // A blocked process can take ownership after the previous owner exits.
    const next = instances.find((instance) => instance !== owner)!;
    const retry = await next.client.callTool({ name: 'check_login_status', arguments: {} });
    assert.match(JSON.stringify(retry.content), /✅ Logged in/);
    assert.equal((next.stderr.match(/TEST_BROWSER_LAUNCH/g) ?? []).length, 1);
  } finally {
    await Promise.all(
      instances.map(async ({ client, transport }) => {
        await client.close();
        await transport.close();
      }),
    );
    await rmdir(profile);
  }
}
