#!/bin/bash
set -e

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN tidak tersedia"
  exit 1
fi

GITHUB_USER="yapperfund"
GITHUB_REPO="Yapper-Fund"
REMOTE_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

echo "=== Setup GitHub Push ==="

echo "[1/5] Membersihkan lock files..."
rm -f .git/config.lock .git/index.lock 2>/dev/null || true

echo "[2/5] Mengatur git user..."
git config user.name "$GITHUB_USER"
git config user.email "${GITHUB_USER}@users.noreply.github.com"

echo "[3/5] Mengatur remote github..."
if git remote get-url github &>/dev/null; then
  git remote set-url github "$REMOTE_URL"
  echo "   Remote diupdate"
else
  git remote add github "$REMOTE_URL"
  echo "   Remote ditambahkan"
fi

echo "[4/5] Push ke GitHub..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push github "$BRANCH":main --force

echo ""
echo "=== BERHASIL! ==="
echo "Kode berhasil di-push ke:"
echo "https://github.com/${GITHUB_USER}/${GITHUB_REPO}"
