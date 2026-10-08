# Configuration

Install and build from source as described in the [README](../README.md).

This fork configures Shopee Philippines through environment variables. To preserve the existing implementation, the source still defaults to `shopee.co.id` when `SHOPEE_DOMAIN` is absent. The supplied `.env.example` selects `shopee.ph`.

## Philippines setup

1. Copy `.env.example` to `.env` in the checkout.
2. Keep `SHOPEE_DOMAIN=shopee.ph`. Set `SHOPEE_PROFILE_DIR` to an **absolute path** for a dedicated Philippines profile, for example `C:/Users/YOUR_USERNAME/.shopee-mcp/chrome-profile-ph`, replacing `YOUR_USERNAME`.
3. Run `npm run login` from the checkout. Complete login in the browser, then press Enter in the terminal.
4. Configure your MCP client with the same domain and absolute profile path. Close the login process before starting the server; only one process should use a profile at a time.

`dotenv` reads `.env` from the process's **working directory**, not from the location of `build/index.js`. Existing environment variables take precedence. A desktop client's working directory may differ from the checkout, so explicitly supply the settings in its environment. Do not assume `~`, `%USERPROFILE%`, or `$HOME` will expand inside `.env` or JSON; use the full path.

## Environment variables

| Variable               | Source default                                         | Purpose                                                                                       |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `SHOPEE_DOMAIN`        | `shopee.co.id`                                         | Use `shopee.ph` for this fork's Philippines configuration.                                    |
| `SHOPEE_LOCALE`        | Derived from domain                                    | Optional browser locale override; PH uses `en-PH`.                                            |
| `SHOPEE_TIMEZONE`      | Derived from domain                                    | Optional browser timezone override; PH uses `Asia/Manila`.                                    |
| `SHOPEE_PROFILE_DIR`   | `.shopee-mcp/chrome-profile` under your home directory | Persistent browser profile, including the saved login. Set an absolute, region-specific path. |
| `SHOPEE_HEADLESS`      | `false`                                                | The browser normally needs a display; `true` is experimental.                                 |
| `SHOPEE_ACCOUNT_TOOLS` | `auto`                                                 | `auto` offers account reads and writes while logged in; `off` hides all account tools.        |
| `CACHE_TTL_MS`         | `30000`                                                | In-memory cache lifetime in milliseconds.                                                     |
| `DEBUG`                | `false`                                                | Only `true` enables diagnostic logging to stderr.                                             |

Locale, timezone and currency are derived from the domain suffix:

| Suffix | Locale  | Timezone            | Currency |
| ------ | ------- | ------------------- | -------- |
| `.ph`  | `en-PH` | `Asia/Manila`       | `PHP`    |
| `.id`  | `id-ID` | `Asia/Jakarta`      | `IDR`    |
| `.my`  | `en-MY` | `Asia/Kuala_Lumpur` | `MYR`    |
| `.sg`  | `en-SG` | `Asia/Singapore`    | `SGD`    |
| `.tw`  | `zh-TW` | `Asia/Taipei`       | `TWD`    |
| Other  | `id-ID` | `Asia/Jakarta`      | `IDR`    |

Currency is derived from the domain; there is no `SHOPEE_CURRENCY` setting. Changing the locale does not change the storefront or currency. Use a separate profile when changing storefronts.

## MCP client example

For clients that accept an `mcpServers` configuration, replace both example paths with your own:

```json
{
  "mcpServers": {
    "shopee-ph": {
      "command": "node",
      "args": ["C:/path/to/shopee-ph-mcp/build/index.js"],
      "env": {
        "SHOPEE_DOMAIN": "shopee.ph",
        "SHOPEE_PROFILE_DIR": "C:/Users/YOUR_USERNAME/.shopee-mcp/chrome-profile-ph",
        "SHOPEE_ACCOUNT_TOOLS": "off"
      }
    }
  }
}
```

The transport is **stdio**. Other clients may use different configuration syntax; they need the same command, arguments and environment. Reload the client after editing its configuration. The example hides account tools; set `SHOPEE_ACCOUNT_TOOLS=auto` only when you want them available. See [security guidance](../SECURITY.md) before enabling them.

On Linux without a desktop display, an installed virtual display can wrap the command: `xvfb-run -a node /absolute/path/to/shopee-ph-mcp/build/index.js`. The interactive login also needs a display you can access.

## Authentication and timeouts

Connecting the MCP server and listing tools do not launch a browser. The first browser-backed tool call opens it. With `SHOPEE_ACCOUNT_TOOLS=auto`, account tools start hidden and appear after `check_login_status` or another authenticated tool verifies the session; the client is notified to refresh its tool list.

On Windows, a process guard prevents multiple MCP or login processes from launching browsers for the same profile. Competing calls return a profile-in-use error without opening another window. Ownership is released when the browser closes or its owning process exits. Existing login pages are reused; surplus `about:blank` tabs are closed without changing cookies or other pages. OpenCode can still start duplicate MCP processes, so configure one Shopee instance per profile.

Use `check_login_status` to check the profile. This is a best-effort cookie check, so an expired or rejected session can still require another login. Most product tools fail promptly when signed out; shop profiles may work anonymously.

Calls navigate a real browser and can take tens of seconds. Client timeouts must allow for navigation, page interactions and occasional retries. Exact variant stock uses a separate round trip per selection and has an internal time budget; increasing a client's timeout does not remove that budget. Cached reads can return sooner.

Keep the profile and `.env` private. Never include cookies, browser state, account data or unredacted diagnostic output in an issue.
