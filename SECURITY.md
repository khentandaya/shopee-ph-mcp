# Security

Security fixes target the current `main` branch of this Philippines adaptation.

## Report a vulnerability

Use this repository's **Security → Report a vulnerability** feature.
Do not put exploit details, credentials, private account data or browser files in public issues.
If private reporting is unavailable, open an issue requesting a private reporting channel without disclosing sensitive details.
Include the affected commit, impact and a minimal reproduction with synthetic data.
Report upstream dependency issues to their respective maintainers.

## Session and account data

- The persistent browser profile contains login cookies and other sensitive state. Treat it like a password. Use a dedicated directory outside the checkout; see [setup](README.md#installation).
- Browser profile files stay on your machine, but the authenticated browser sends session credentials to Shopee. Tool results are passed to your MCP client and may be logged or sent to its model provider.
- `SHOPEE_ACCOUNT_TOOLS=off` disables all account tools while preserving product discovery. The sample setup selects `off`; the underlying source defaults to `auto`.
- In `auto` mode, login exposes private orders, cart, vouchers, coins and notifications, plus tools to add/update/remove cart items, like/unlike products, follow/unfollow shops and claim vouchers. A voucher claim cannot be undone. The server does not implement checkout or payment.
- Tool annotations are hints, not an approval system. Use a trusted MCP client with approval controls before enabling account actions.
- Use a dedicated browser profile and an unprivileged OS account. The inherited browser launch includes `--no-sandbox`, so do not rely on Chromium sandbox isolation or expose this local stdio server as a public service.
- Stop clients using the profile before running login or another server instance. Do not delete a profile to resolve a lock while it is in use.

## Keep private files out of Git

Never commit `.env` files, real MCP/client configs, browser profiles, cookies, saved storage state, private keys, account exports, HAR files, screenshots containing personal data or debug logs. `.env.example` contains configuration examples only.

The ignore rules cover common names, but cannot recognize sensitive data saved under arbitrary filenames. Before every push, review `git status --short`, `git diff --cached --name-only` and `git diff --cached`; never force-add ignored private files. Keep downloaded browsers and `node_modules` out of commits and release archives.

If credentials or session data are exposed, revoke the affected credentials or sessions first. Removing a file in a later commit does not remove it from Git history, forks or caches. Coordinate history cleanup with maintainers and GitHub support where needed.

## Testing and dependencies

`npm run test:unit` is offline. `npm test` launches a browser and contacts Shopee; with account mode enabled it can read private account data. Do not use a real browser profile in CI. Sanitize error output before sharing it.

Dependencies retain their own licenses; the CloakBrowser binary has separate terms and is not redistributed here. See [ATTRIBUTION.md](ATTRIBUTION.md).
