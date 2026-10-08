# Attribution and third-party licenses

Reviewed on 2026-10-08.

## Upstream project

Shopee PH MCP adapts [bintangtimurlangit/shopee-mcp](https://github.com/bintangtimurlangit/shopee-mcp) for the Philippines. Its preserved upstream base is commit [`8f14b96c6b095d60a88b40471c6e7bafd4f96ec0`](https://github.com/bintangtimurlangit/shopee-mcp/commit/8f14b96c6b095d60a88b40471c6e7bafd4f96ec0).

The [license at that exact commit](https://github.com/bintangtimurlangit/shopee-mcp/blob/8f14b96c6b095d60a88b40471c6e7bafd4f96ec0/LICENSE) was checked against the local copy. This fork retains the MIT license for its source code and preserves [LICENSE](LICENSE) unchanged, including **Copyright (c) 2026 Bintang Timurlangit**. MIT permits modification and redistribution subject to preserving its copyright and permission notice.

The inherited Git history preserves the original authorship, including Bintang Timurlangit, Dennis Lee, Teguh Arifianto, and dependency-update commits. Existing [CHANGELOG](CHANGELOG.md) acknowledgments remain, including [@dennislwy](https://github.com/dennislwy), [@nundorn](https://github.com/nundorn), [@franshjy](https://github.com/franshjy), and [@DystopiaOwO](https://github.com/DystopiaOwO). The cart tools retain their acknowledgment of the DystopiaOwO fork in [src/tools/cart.ts](src/tools/cart.ts).

## Runtime dependencies

These versions and licenses were checked against the lockfile and installed package metadata/license files. The links identify their upstream projects. Dependencies retain their own terms; this project's MIT license does not replace them.

| Dependency                                                                                      | Locked version | License      |
| ----------------------------------------------------------------------------------------------- | -------------- | ------------ |
| [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | 1.30.0         | MIT          |
| [CloakBrowser JavaScript wrapper](https://github.com/CloakHQ/CloakBrowser)                      | 0.5.10         | MIT          |
| [dotenv](https://github.com/motdotla/dotenv)                                                    | 17.4.2         | BSD-2-Clause |
| [Playwright](https://github.com/microsoft/playwright)                                           | 1.63.0         | Apache-2.0   |
| [Zod](https://github.com/colinhacks/zod)                                                        | 3.25.76        | MIT          |

This is a source repository: installed dependencies, browser binaries, and caches are excluded. The table covers direct runtime dependencies, not every transitive or development dependency. If you later bundle third-party code, preserve the applicable license and notice files from those packages, including Playwright's NOTICE.

## CloakBrowser binary

The wrapper's [MIT license](https://github.com/CloakHQ/CloakBrowser/blob/main/LICENSE) is separate from the compiled browser's [CloakBrowser Binary License](https://github.com/CloakHQ/CloakBrowser/blob/main/BINARY-LICENSE.md). The binary is not distributed by this repository.

The binary terms reviewed expressly allow dependency listing with end users downloading from official CloakHQ channels. They restrict redistribution and bundling of the binary and require separate permission for certain hosted, OEM, or SaaS uses. Users should review the applicable binary terms and any version-specific access requirements before downloading or deploying it.

Shopee and other product names and trademarks belong to their respective owners. This is an unofficial project and does not claim their endorsement.
