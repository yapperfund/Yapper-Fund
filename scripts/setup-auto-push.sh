#!/bin/bash
# Setup auto-push ke GitHub setiap kali ada commit baru di Replit

set -e

GITHUB_USER="yapperfund"
GITHUB_REPO="Yapper-Fund"

echo "=== Setup Auto-Push ke GitHub ==="

echo "[1/3] Membersihkan lock files..."
rm -f .git/config.lock .git/index.lock 2>/dev/null || true

echo "[2/3] Mengatur remote github..."
REMOTE_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${GITHUB_REPO}.git"
if git remote get-url github &>/dev/null; then
  git remote set-url github "$REMOTE_URL"
else
  git remote add github "$REMOTE_URL"
fi

echo "[3/3] Membuat post-commit hook untuk auto-push..."
cat > .git/hooks/post-commit << 'HOOK'
#!/bin/bash
GITHUB_USER="yapperfund"
GITHUB_REPO="Yapper-Fund"
REMOTE_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

if git remote get-url github &>/dev/null; then
  git remote set-url github "$REMOTE_URL"
fi

echo "[Auto-Push] Mengirim perubahan ke GitHub..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push github "$BRANCH":main --force 2>&1
echo "[Auto-Push] Selesai!"
HOOK

chmod +x .git/hooks/post-commit
echo ""
echo "=== SELESAI! ==="
echo "Auto-push sudah aktif!"
echo "Setiap kali ada commit di Replit, kode otomatis di-push ke:"
echo "https://github.com/${GITHUB_USER}/${GITHUB_REPO}"
echo ""
echo "Untuk push sekarang, jalankan:"
echo "  bash scripts/push-to-github.sh"
