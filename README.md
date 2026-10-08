# Shopee Philippines MCP

[![CI](https://github.com/khentandaya/shopee-ph-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/khentandaya/shopee-ph-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An unofficial local MCP server for exploring **Shopee Philippines**: product search, peso prices, variants, reviews, shops and flash sales through your own browser session.

This is a Philippines adaptation of [bintangtimurlangit/shopee-mcp](https://github.com/bintangtimurlangit/shopee-mcp), based on upstream v0.3.0. The original Git history, MIT license and contributor credits are preserved. See [ATTRIBUTION.md](ATTRIBUTION.md).

**Configuration matters:** this fork adds Philippine region handling and locale-aware output while retaining the source's upstream defaults. Copy the supplied configuration to select `shopee.ph`, `en-PH`, `Asia/Manila` and `PHP`. The examples disable account tools; enabling `auto` exposes private account reads and actions after login.

## Installation

Use **Node.js 24+**, npm and Git, plus a desktop display (or a virtual display on Linux). This fork is installed from source; the upstream npm package does not contain these local Philippine changes.

```sh
git clone https://github.com/khentandaya/shopee-ph-mcp.git
cd shopee-ph-mcp
npm ci --ignore-scripts
npm run build
```

Copy `.env.example` to `.env`:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```sh
# Linux/macOS shell
cp .env.example .env
```

Edit `.env` and uncomment `SHOPEE_PROFILE_DIR`, replacing the example with an **absolute path outside the checkout**, such as `C:/Users/YOUR_USER/.shopee-mcp/chrome-profile-ph`. Use the same profile path for login and your MCP client. Do not put `~`, `$HOME` or `%USERPROFILE%` in the value: they are not expanded. The example selects `SHOPEE_ACCOUNT_TOOLS=off`.

CloakBrowser downloads its browser from its own distribution service when needed on first launch. The browser has [separate license terms](https://github.com/CloakHQ/CloakBrowser/blob/main/BINARY-LICENSE.md), is not included in this repository, and requires network access and disk space. `--ignore-scripts` skips install hooks; offline checks need no browser or Shopee login.

### Log in

Stop any MCP server using the same profile, then run from the checkout:

```sh
npm run login
```

Complete login, OTP or CAPTCHA yourself in the opened CloakBrowser window, then press Enter in the terminal. Logging in with your everyday browser does not authenticate this dedicated profile. Run login again when the session expires.

Only one browser instance can own a profile at a time. After login closes, restart your MCP client.

### Register with your MCP client

For clients using an `mcpServers` configuration, adapt this example. Replace both paths with your actual absolute paths; forward slashes work on Windows.

```json
{
  "mcpServers": {
    "shopee-ph": {
      "command": "node",
      "args": ["C:/path/to/shopee-ph-mcp/build/index.js"],
      "env": {
        "SHOPEE_DOMAIN": "shopee.ph",
        "SHOPEE_LOCALE": "en-PH",
        "SHOPEE_TIMEZONE": "Asia/Manila",
        "SHOPEE_PROFILE_DIR": "C:/Users/YOUR_USER/.shopee-mcp/chrome-profile-ph",
        "SHOPEE_HEADLESS": "false",
        "SHOPEE_ACCOUNT_TOOLS": "off"
      }
    }
  }
}
```

Other clients use different configuration schemas; use the same command, arguments and environment variables in their local MCP settings. A client may start in another working directory, so its explicit environment is more reliable than expecting it to find the checkout's `.env`.

On Linux without a display, use `xvfb-run -a node /absolute/path/to/shopee-ph-mcp/build/index.js` and a matching virtual display for login. Keep `SHOPEE_HEADLESS=false`.

Start with `check_login_status`, then search for a product. See [configuration](docs/CONFIGURATION.md) for defaults and troubleshooting.

## Tools

| Tool                   | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `search_products`      | Search with sorting, price/rating/location/Mall filters and pagination. |
| `get_product_detail`   | Product prices, specifications, shipping, seller and description.       |
| `get_product_variants` | Model IDs, variant prices and availability; optional exact stock.       |
| `get_product_reviews`  | Rating summaries and paginated reviews with filters.                    |
| `get_shop_info`        | Seller profile by ID or username.                                       |
| `get_shop_products`    | Paginated seller catalogue.                                             |
| `get_flash_sale`       | Flash-sale sessions and deals.                                          |
| `check_login_status`   | Check the saved session and refresh account-tool availability.          |

Product discovery generally requires login. Shop profile lookup can work without it. These discovery tools do not change your cart or account.

## Account mode (experimental)

The sample configuration disables account tools. Set `SHOPEE_ACCOUNT_TOOLS=auto` only when you want them available. With a confirmed login, the server shows them and notifies the client to refresh its tool list.

| Account reads                    | Account actions                                |
| -------------------------------- | ---------------------------------------------- |
| `get_orders`, `get_order_detail` | `add_to_cart`                                  |
| `get_my_vouchers`, `get_coins`   | `update_cart_item` (including removal)         |
| `get_notifications`, `get_cart`  | `like_product`, `follow_shop` (including undo) |
| `get_shop_vouchers`              | `claim_shop_voucher` (cannot be undone)        |

The server does not implement checkout, payment or account settings changes. Account results can contain private information and go to your MCP client. Tool annotations do not enforce user approval; configure your client accordingly. UI-driven actions can break when Shopee changes its pages. The cart tools build on [@DystopiaOwO](https://github.com/DystopiaOwO)'s upstream contribution.

## Configuration

| Setting                | Philippine example                     | Unconfigured source default    |
| ---------------------- | -------------------------------------- | ------------------------------ |
| `SHOPEE_DOMAIN`        | `shopee.ph`                            | `shopee.co.id`                 |
| `SHOPEE_LOCALE`        | `en-PH`                                | Derived from domain            |
| `SHOPEE_TIMEZONE`      | `Asia/Manila`                          | Derived from domain            |
| Currency               | `PHP`, derived from domain             | `IDR` for the default domain   |
| `SHOPEE_PROFILE_DIR`   | Your absolute `chrome-profile-ph` path | `~/.shopee-mcp/chrome-profile` |
| `SHOPEE_HEADLESS`      | `false`                                | `false`                        |
| `SHOPEE_ACCOUNT_TOOLS` | `off`                                  | `auto`                         |
| `CACHE_TTL_MS`         | `30000`                                | `30000`                        |
| `DEBUG`                | `false`                                | `false`                        |

Indonesia, Malaysia, Singapore and Taiwan mappings remain supported. The Philippines adaptation adds the `.ph` mapping and uses the selected locale for prices and counts. Unknown domains retain the upstream Indonesian fallback.

## Development and checks

```sh
npm run lint
npm run format:check
npm run typecheck
npm run test:unit
npm run build
```

CI runs these offline checks on Node.js 24. Unit fixtures intentionally select Indonesian defaults for regression coverage and include Philippine mapping and peso-format checks.

`npm test` is a separate **live** smoke test: it starts a browser and contacts Shopee. With account tools enabled it also reads private account data. A login-required response can count as a smoke-test pass; that does not prove authenticated product access. Keep it out of CI and stop other instances sharing the profile before running it.

This repository is GitHub/source-only: `private: true` in package metadata prevents accidental npm publishing; it does not make the GitHub repository private. The inherited npm release automation has been removed.

## Troubleshooting

- **Not logged in:** run login using the same absolute profile path and Philippine environment as the MCP client.
- **Profile already in use:** stop the server owning that profile, finish login, then restart one client.
- **Wrong currency or domain:** set the client environment explicitly; `.env` is read from the process working directory.
- **Blocked or empty result:** confirm login, use a visible browser and retry later. Shopee's site and anti-bot behavior can change.
- **Missing account tools:** the sample deliberately uses `off`. With `auto`, a confirmed login and client tool-list refresh are required.

## Security, license and attribution

Read [SECURITY.md](SECURITY.md) before enabling account tools or sharing logs. Keep `.env`, profiles, cookies, browser downloads and account data out of Git.

Source code is [MIT licensed](LICENSE), with **Copyright (c) 2026 Bintang Timurlangit** preserved. Dependencies retain their own licenses; the downloaded CloakBrowser binary is separately licensed. [ATTRIBUTION.md](ATTRIBUTION.md) records provenance and dependency notices; [CHANGELOG.md](CHANGELOG.md) preserves upstream release history.

Contributions: [CONTRIBUTING.md](CONTRIBUTING.md). More documentation: [docs/README.md](docs/README.md).

This project is **not affiliated with, endorsed by or maintained by Shopee or Sea Limited**. Use your own authorized session and comply with Shopee's applicable terms. Product names and trademarks belong to their owners.
