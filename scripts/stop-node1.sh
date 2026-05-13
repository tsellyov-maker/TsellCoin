#!/usr/bin/env bash
set -e

cd /home/tsellyov/Projetos/TsellCoin/tsellcoin-core

./build/bin/tsellcoin-cli \
  -datadir="$HOME/.tsellcoin-node1" \
  -rpcport=18389 \
  stop
