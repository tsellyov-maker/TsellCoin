#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

VERSION="${1:-0.1.0}"
ARCH="linux-x86_64"
NAME="tsellcoin-${VERSION}-${ARCH}"
DIST_DIR="$PROJECT_ROOT/dist"
PACKAGE_DIR="$DIST_DIR/$NAME"

echo "Building TsellCoin release: $NAME"

rm -rf build-release "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

cmake -B build-release \
  -DCMAKE_BUILD_TYPE=Release \
  -DBUILD_GUI=OFF \
  -DENABLE_IPC=OFF \
  -DBUILD_TESTS=OFF \
  -DBUILD_BENCH=OFF

cmake --build build-release -j"$(nproc)"

cp build-release/bin/tsellcoind "$PACKAGE_DIR/"
cp build-release/bin/tsellcoin-cli "$PACKAGE_DIR/"
cp build-release/bin/tsellcoin "$PACKAGE_DIR/"

strip "$PACKAGE_DIR/tsellcoind" || true
strip "$PACKAGE_DIR/tsellcoin-cli" || true
strip "$PACKAGE_DIR/tsellcoin" || true

cat > "$PACKAGE_DIR/README.md" <<README
# TsellCoin Core $VERSION

Experimental TsellCoin Core Linux x86_64 release.

## Binaries

- tsellcoind
- tsellcoin-cli
- tsellcoin

## Mainnet

Genesis:
000095e23d5aa4c0fcc3cdf77dcc0f223bfd11bde228600a1adf534298e96d8c

P2P port:
18388

Bech32 prefix:
tsc

## Start node

Example:

\`\`\`bash
./tsellcoind -daemon
\`\`\`

Check status:

\`\`\`bash
./tsellcoin-cli getblockchaininfo
\`\`\`

Warning: experimental software. Do not use as investment, public sale, or financial promise.
README

cd "$DIST_DIR"
tar -czf "$NAME.tar.gz" "$NAME"
sha256sum "$NAME.tar.gz" > "$NAME.tar.gz.sha256"

echo
echo "Release created:"
echo "$DIST_DIR/$NAME.tar.gz"
echo "$DIST_DIR/$NAME.tar.gz.sha256"
