#!/usr/bin/env bash
set -e

cd /home/tsellyov/Projetos/TsellCoin/tsellcoin-core

echo "=== TsellCoin node1 status ==="

./build/bin/tsellcoin-cli \
  -datadir="$HOME/.tsellcoin-node1" \
  -rpcport=18389 \
  getblockchaininfo | grep -E '"chain"|"blocks"|"headers"|"bestblockhash"|"difficulty"'

echo
echo "Connections:"
./build/bin/tsellcoin-cli \
  -datadir="$HOME/.tsellcoin-node1" \
  -rpcport=18389 \
  getconnectioncount

echo
echo "Wallet balance:"
./build/bin/tsellcoin-cli \
  -datadir="$HOME/.tsellcoin-node1" \
  -rpcport=18389 \
  -rpcwallet=tsell \
  getbalances 2>/dev/null || echo "Wallet tsell not loaded."
