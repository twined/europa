# Release Instructions

  1. git-flow: Start release. Tag without "v", e.g. 0.1.0 - NOT v0.1.0!
  2. Bump version in `CHANGELOG`
  3. Bump version in `package.json`
  4. Commit with `Prepare X.X.X release`
  5. git-flow: finish release. Tag without "v", e.g. 0.1.0 - NOT v0.1.0!
     - tag message: Release vX.X.X
  6. Switch to master. Push.
  7. Push `X.X.X` tag to `origin`
  8. Switch to develop-branch.
