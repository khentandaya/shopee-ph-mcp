import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const serverEntry = process.argv[2] ?? fileURLToPath(new URL('../src/index.ts', import.meta.url));

for (const [mode, tool] of [
  ['auto', 'check_login_status'],
  ['auto', 'search_products'],
  ['off', 'check_login_status'],
]) {
  const profile = await mkdtemp(
    join(fileURLToPath(new URL('../', import.meta.url)), '.shopee-startup-test-'),
  );
  const client = new Client({ name: 'startup-regression', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      '--import',
      'tsx',
      '--import',
      new URL('./fixtures/mock-browser.mjs', import.meta.url).href,
      serverEntry,
    ],
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: {
      SHOPEE_DOMAIN: 'shopee.ph',
      SHOPEE_ACCOUNT_TOOLS: mode,
      SHOPEE_PROFILE_DIR: profile,
      DEBUG: 'false',
    },
    stderr: 'pipe',
  });
  let stderr = '';
  transport.stderr?.on('data', (chunk: Buffer) => {
    stderr += chunk.toString();
  });
  try {
    await client.connect(transport, { timeout: 10000 });
    const initial = await client.listTools({}, { timeout: 10000 });
    assert.ok(initial.tools.some((tool) => tool.name === 'search_products'));
    assert.ok(!initial.tools.some((tool) => tool.name === 'get_orders'));
    await client.listTools({}, { timeout: 10000 });
    assert.ok(!stderr.includes('TEST_BROWSER_LAUNCH'), `Startup launched a browser (${mode})`);

    const result = await client.callTool({
      name: tool,
      arguments: tool === 'search_products' ? { query: 'test' } : {},
    });
    assert.ok(
      !result.isError && !JSON.stringify(result.content).includes('❌'),
      JSON.stringify(result),
    );
    const afterLogin = await client.listTools({}, { timeout: 10000 });
    assert.equal(
      afterLogin.tools.some((tool) => tool.name === 'get_orders'),
      mode === 'auto',
    );
  } catch (error) {
    throw new Error(`Startup regression failed (${mode}): ${stderr}`, { cause: error });
  } finally {
    await client.close();
    await transport.close();
    await rmdir(profile);
  }
  assert.equal((stderr.match(/TEST_BROWSER_LAUNCH/g) ?? []).length, 1);
  assert.equal((stderr.match(/TEST_BLANK_CLOSED/g) ?? []).length, 8);
}
