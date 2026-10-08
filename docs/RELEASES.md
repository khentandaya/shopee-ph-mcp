# Releases and versioning

This fork is distributed from source at [khentandaya/shopee-ph-mcp](https://github.com/khentandaya/shopee-ph-mcp). It is not published as an npm package. The package is marked `private` to prevent accidental npm publication, and the upstream npm publishing workflow is not used.

The existing Git history and upstream changelog entries retain their original attribution. Upstream release numbers describe the upstream project; do not imply that this fork owns or publishes `@bintangtimurlangit/shopee-mcp`.

For a fork release:

1. Update `package.json` and the root package metadata in `package-lock.json` together if the version changes.
2. Record the fork's changes in `CHANGELOG.md`, preserving historical entries.
3. Run the offline checks and build listed in [Development](./DEVELOPMENT.md).
4. Review the staged files and Git history for credentials, browser profiles, private account data and temporary files.
5. Create a descriptive Git tag and GitHub release only when ready to publish that version. State which checks ran and whether live tests were performed.

Use [Semantic Versioning](https://semver.org/) for future version changes. Publishing to npm would require a separate, deliberate package-name and release-process decision.
