#!/usr/bin/env bash
# Creates and pushes the release tag v$VERSION on a commit that ships the
# GitHub Action bundle.
#
# main does not track github-action/dist/index.js, so this script builds the
# bundle, commits it on top of the checked-out commit and tags that commit.
# Only the tag is pushed: the release commit is reachable from the tag, never
# from main.
#
# Usage: VERSION=1.2.3 bash scripts/tag-action-release.sh
set -euo pipefail

: "${VERSION:?VERSION is required (MAJOR.MINOR.PATCH, without the v prefix)}"
tag="v$VERSION"

# A retry of the same run finds its own tag. A later commit with the same
# version (e.g. after a failed npm publish) must not publish other code under
# that tag, so the tagged source has to match this commit, bundle aside.
if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
  if ! git diff --quiet "refs/tags/$tag^{commit}" HEAD -- . ':(exclude)github-action/dist/index.js'; then
    echo "❌ Tag $tag already exists on different source. Bump the version instead of reusing it." >&2
    exit 1
  fi
  echo "ℹ️ Tag $tag already exists on this source; leaving it as it is."
  exit 0
fi

pnpm build:gha

bot=(-c user.name="github-actions[bot]" -c user.email="github-actions[bot]@users.noreply.github.com")

# Stage only the Action files: other steps may leave unrelated edits behind
git add -f github-action/dist/index.js action.yml
git "${bot[@]}" commit --quiet --allow-empty -m "build: GitHub Action bundle for $tag"
git ls-files --error-unmatch github-action/dist/index.js github-action/action.yml action.yml >/dev/null

git "${bot[@]}" tag -a "$tag" -m "Release $tag"
git push origin "refs/tags/$tag"
echo "✅ Tagged $tag at $(git rev-parse --short HEAD) with the GitHub Action bundle"
