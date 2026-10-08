import { registerHooks } from 'node:module';

// Replace the launcher before the server imports it; no real browser can start.
const mockUrl = 'mock:cloakbrowser';
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'cloakbrowser') return { url: mockUrl, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url !== mockUrl) return nextLoad(url, context);
    return {
      format: 'module',
      shortCircuit: true,
      source: `
        import process from 'node:process';
        export async function launchPersistentContext() {
          process.stderr.write('TEST_BROWSER_LAUNCH\\n');
          if (process.env.TEST_LAUNCH_FAILURE === 'true') throw new Error('Mock launch failed');
          const onClose = [];
          const page = {
            isClosed: () => false,
            url: () => 'https://shopee.ph/buyer/login',
            goto: async () => {},
            waitForResponse: async (predicate) => {
              const response = {
                url: () => 'https://shopee.ph/api/v4/search/search_items',
                json: async () => ({ error: 0, items: [], total_count: 0 }),
              };
              await predicate(response);
              return response;
            },
          };
          const blankPages = Array.from({ length: 8 }, () => {
            let closed = false;
            return {
              isClosed: () => closed,
              url: () => 'about:blank',
              close: async () => {
                closed = true;
                process.stderr.write('TEST_BLANK_CLOSED\\n');
              },
            };
          });
          return {
            once: (event, callback) => { if (event === 'close') onClose.push(callback); },
            cookies: async () => [{ name: 'SPC_U', value: 'test-only' }],
            pages: () => [...blankPages, page],
            close: async () => { onClose.splice(0).forEach((callback) => callback()); },
          };
        }
      `,
    };
  },
});
