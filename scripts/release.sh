#!/bin/sh
# Publishes the release branch apps install: runs the checks, builds the compiled tree, force-pushes it.
# The same steps as scripts/release.workflow.yml, for when CI cannot push (copy that file to .github/workflows/
# with a token that has the workflow scope to automate this).
set -e
cd "$(dirname "$0")/.."
npm run ci
out="$(mktemp -d)/release"
node scripts/make-release.mjs "$out"
sha="$(git rev-parse --short HEAD)"
remote="$(git remote get-url origin)"
cd "$out"
git init -q -b release
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" commit -qm "release from $sha"
git push -q -f "$remote" release
echo "release branch updated from $sha"
