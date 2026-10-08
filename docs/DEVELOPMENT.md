# Development

Use **Node.js 24 or newer** and Git. The development dependencies require newer Node versions than the original upstream `18+` guidance.

```bash
npm ci --ignore-scripts
npm run lint
npm run format:check
npm run typecheck
npm run test:unit
npm run build
```

Installation requires access to the package registry. `--ignore-scripts` skips dependency lifecycle scripts and local Git-hook setup. The checks above run without a Shopee login or browser; the browser binary is downloaded or reused when a browser session is launched. For optional local Git hooks, run `npm run prepare` explicitly after reviewing the hook files.

## Scripts

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run build`        | Clean `build/` and compile TypeScript.   |
| `npm start`            | Run the compiled stdio server.           |
| `npm run dev`          | Run the source server in watch mode.     |
| `npm run login`        | Open the interactive browser login.      |
| `npm run lint`         | Check code with ESLint.                  |
| `npm run format:check` | Check formatting without changing files. |
| `npm run format`       | Rewrite formatting with Prettier.        |
| `npm run typecheck`    | Check TypeScript without emitting files. |
| `npm run test:unit`    | Run offline unit tests.                  |
| `npm test`             | Run the live browser smoke test.         |

## Offline and live tests

`test/unit.ts` checks parsing, formatting, region mappings, authentication handling and account-tool visibility. `test/setup.ts` deliberately pins Indonesian fixture settings so a local Philippines `.env` does not change expected fixture output; the suite also includes Philippines currency and region cases. It does not prove live Shopee availability.

The unit suite also runs `test/startup.ts` against the stdio server with the browser launcher replaced by `test/fixtures/mock-browser.mjs`. It verifies that initialization and tool listing launch no browser, while an explicit login check enables account tools only in `auto` mode.

On Windows, `test/duplicate-browser.ts` checks eight competing MCP processes and ownership transfer. `test/session-lifecycle.ts` checks failed-launch retries, reuse within one process, blank-tab cleanup and recovery after window closure. These tests use isolated empty profiles and a mocked launcher; they do not open Chromium or read your saved login.

`npm test` starts the source MCP server and calls live tools. It requires a working display and browser, and uses the configured profile. Configure the Philippines domain and profile as described in [Configuration](./CONFIGURATION.md) first. With account mode enabled and a detected login, it also reads orders, cart, vouchers, coins and notifications. It does **not** invoke account-changing tools. Set `SHOPEE_ACCOUNT_TOOLS=off` to exclude these account reads.

A smoke-test pass may mean a clean login prompt was returned; it is not necessarily an authenticated product-data success. Verify which tools returned real data when reporting live results. Do not commit smoke-test output containing account information. CI runs the offline checks only.

## Layout and implementation

- `src/index.ts`: stdio server and tool registration.
- `src/browser/session.ts`: shared persistent browser context and serialized navigation.
- `src/api/`: Shopee response handling, authentication checks and types.
- `src/tools/`: product, shop, account and action tools.
- `src/account-mode.ts`: account-tool visibility after login checks.
- `src/utils/`: formatting, errors and the in-memory cache.
- `test/`: offline fixtures and the optional live smoke test.

The server drives [CloakBrowser](https://github.com/CloakHQ/cloakbrowser), navigates Shopee pages and captures responses from the site's own requests. It normally runs with a visible browser; Shopee site changes can break this integration.

Generated `build/`, dependencies, `.env`, browser profiles and temporary files must stay out of Git. Keep the original upstream license and contributor attribution when changing or redistributing the project. This fork is distributed from source; see [Releases](./RELEASES.md).
