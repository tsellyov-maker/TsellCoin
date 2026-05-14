#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

VERSION="${1:-0.1.1}"
PKG_NAME="tsellcoin"
ARCH="amd64"
DEB_NAME="tsellcoin-${VERSION}-linux-${ARCH}.deb"

BUILD_DIR="$PROJECT_ROOT/build-release"
DIST_DIR="$PROJECT_ROOT/dist"
PKG_DIR="$DIST_DIR/deb/$PKG_NAME"

echo "Building TsellCoin .deb package: $DEB_NAME"

rm -rf "$DIST_DIR/deb"
mkdir -p "$PKG_DIR/DEBIAN"
mkdir -p "$PKG_DIR/usr/bin"
mkdir -p "$PKG_DIR/usr/share/doc/tsellcoin"

if [ ! -f "$BUILD_DIR/bin/tsellcoind" ]; then
  cmake -B build-release \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_GUI=OFF \
    -DENABLE_IPC=OFF \
    -DBUILD_TESTS=OFF \
    -DBUILD_BENCH=OFF

  cmake --build build-release -j"$(nproc)"
fi

cp "$BUILD_DIR/bin/tsellcoind" "$PKG_DIR/usr/bin/"
cp "$BUILD_DIR/bin/tsellcoin-cli" "$PKG_DIR/usr/bin/"
cp "$BUILD_DIR/bin/tsellcoin" "$PKG_DIR/usr/bin/"

strip "$PKG_DIR/usr/bin/tsellcoind" || true
strip "$PKG_DIR/usr/bin/tsellcoin-cli" || true
strip "$PKG_DIR/usr/bin/tsellcoin" || true

cat > "$PKG_DIR/DEBIAN/control" <<EOF
Package: tsellcoin
Version: $VERSION
Section: utils
Priority: optional
Architecture: $ARCH
Maintainer: Tsell Yov <tsellyov@gmail.com>
Description: Experimental TsellCoin Core node and CLI
 TsellCoin is an experimental Bitcoin Core fork.
 Includes tsellcoind, tsellcoin-cli and tsellcoin.
EOF

cat > "$PKG_DIR/usr/share/doc/tsellcoin/README.md" <<EOF
# TsellCoin Core $VERSION

Experimental TsellCoin Core package.

## Binaries

- /usr/bin/tsellcoind
- /usr/bin/tsellcoin-cli
- /usr/bin/tsellcoin

## Network

Genesis:
000095e23d5aa4c0fcc3cdf77dcc0f223bfd11bde228600a1adf534298e96d8c

P2P port:
18388

Bech32 prefix:
tsc

Warning: experimental software.
EOF

dpkg-deb --build "$PKG_DIR" "$DIST_DIR/$DEB_NAME"

sha256sum "$DIST_DIR/$DEB_NAME" > "$DIST_DIR/$DEB_NAME.sha256"

echo
echo "Created:"
echo "$DIST_DIR/$DEB_NAME"
echo "$DIST_DIR/$DEB_NAME.sha256"
