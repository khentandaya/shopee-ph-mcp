import assert from 'node:assert/strict';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const profile = await mkdtemp(
  join(fileURLToPath(new URL('../', import.meta.url)), '.shopee-lifecycle-test-'),
);
process.env.SHOPEE_PROFILE_DIR = profile;
process.env.SHOPEE_DOMAIN = 'shopee.ph';
const session = await import('../src/browser/session.js');
try {
  process.env.TEST_LAUNCH_FAILURE = 'true';
  await assert.rejects(session.getContext(), /Mock launch failed/);
  delete process.env.TEST_LAUNCH_FAILURE;

  const contexts = await Promise.all(Array.from({ length: 8 }, () => session.getContext()));
  assert.ok(contexts.every((context) => context === contexts[0]));
  assert.deepEqual(
    contexts[0]
      .pages()
      .filter((page) => !page.isClosed())
      .map((page) => page.url()),
    ['https://shopee.ph/buyer/login'],
  );

  // A user closing the window must discard the cached context and its guard.
  await contexts[0].close();
  const reopened = await session.getContext();
  assert.notEqual(reopened, contexts[0]);
} finally {
  delete process.env.TEST_LAUNCH_FAILURE;
  await session.closeContext();
  await rmdir(profile);
}
