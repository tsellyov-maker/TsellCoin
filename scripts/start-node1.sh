#!/usr/bin/env bash
set -e

cd /home/tsellyov/Projetos/TsellCoin/tsellcoin-core

./build/bin/tsellcoind \
  -datadir="$HOME/.tsellcoin-node1" \
  -daemon \
  -server=1 \
  -listen=1 \
  -bind=127.0.0.1 \
  -port=18388 \
  -rpcport=18389 \
  -dnsseed=0 \
  -fixedseeds=0 \
  -discover=0 \
  -listenonion=0
