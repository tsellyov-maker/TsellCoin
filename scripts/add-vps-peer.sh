#!/usr/bin/env bash
set -e

cd /home/tsellyov/Projetos/TsellCoin/tsellcoin-core

VPS_IP="109.199.100.175"

./build/bin/tsellcoin-cli \
  -datadir="$HOME/.tsellcoin-node1" \
  -rpcport=18389 \
  addnode "$VPS_IP:18388" "add"

echo "Added VPS peer: $VPS_IP:18388"
