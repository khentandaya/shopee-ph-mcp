# Contributing to Shopee Philippines MCP

Use **Node.js 24 or newer** and Git. A display and your own Shopee login are needed only for browser use and live tests.

```bash
git clone https://github.com/khentandaya/shopee-ph-mcp.git
cd shopee-ph-mcp
npm ci --ignore-scripts
npm run lint
npm run format:check
npm run typecheck
npm run test:unit
npm run build
```

Create a focused branch and pull request describing the problem, the change and the checks performed. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. Local Git hooks are optional with the installation command above; run `npm run prepare` to enable them after reviewing the hooks.

For browser work, follow [Configuration](./docs/CONFIGURATION.md). `npm test` is a live smoke test and can read private account data when account mode is enabled. It does not invoke account-changing tools. Do not run it against someone else's account or share its unredacted output. See [Development](./docs/DEVELOPMENT.md) for the difference between offline checks and live validation.

Contributions may improve Philippines configuration, discovery, documentation and the existing experimental account tools. Keep changes focused, preserve upstream licensing and credit, and describe any new account side effects clearly. See [SECURITY.md](./SECURITY.md) for handling vulnerabilities and saved sessions.

Never commit `.env`, cookies, browser profiles, tokens, local MCP configuration, personal account data or generated output. Review `git diff --cached` and the staged filenames before committing; ignore rules do not remove a file that is already tracked.

If AI assistance substantially produced a contribution, disclose that in the pull request description and name the model when known.
