#!/bin/bash
set -euo pipefail

# Web 環境以外では実行しない
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# gh CLI がインストール済みならスキップ
if command -v gh &>/dev/null; then
  exit 0
fi

# gh CLI をインストール
GH_VERSION="2.87.0"
GH_ARCHIVE="gh_${GH_VERSION}_linux_amd64.tar.gz"
curl -sL "https://github.com/cli/cli/releases/download/v${GH_VERSION}/${GH_ARCHIVE}" -o "/tmp/${GH_ARCHIVE}"
tar -xzf "/tmp/${GH_ARCHIVE}" -C /tmp/
cp "/tmp/gh_${GH_VERSION}_linux_amd64/bin/gh" /usr/local/bin/gh
chmod +x /usr/local/bin/gh
rm -rf "/tmp/${GH_ARCHIVE}" "/tmp/gh_${GH_VERSION}_linux_amd64"
