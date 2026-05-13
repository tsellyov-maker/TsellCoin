#!/usr/bin/env bash
cd /home/tsellyov/Projetos/TsellCoin/tsellcoin-core

./build/bin/tsellcoind \
  -datadir=$HOME/.tsellcoin-node2 \
  -daemon \
  -server=1 \
  -listen=1 \
  -bind=127.0.0.1 \
  -port=18390 \
  -rpcport=18391 \
  -dnsseed=0 \
  -fixedseeds=0 \
  -discover=0 \
  -listenonion=0 \
  -addnode=127.0.0.1:18388
