#!/usr/bin/env bash
set -e

cd /home/tsellyov/Projetos/TsellCoin/tsellcoin-core

ADDR=$(./build/bin/tsellcoin-cli \
  -datadir="$HOME/.tsellcoin-node1" \
  -rpcport=18389 \
  -rpcwallet=tsell \
  getnewaddress)

echo "Mining to: $ADDR"

./build/bin/tsellcoin-cli \
  -datadir="$HOME/.tsellcoin-node1" \
  -rpcport=18389 \
  generatetoaddress 1 "$ADDR" 100000000
