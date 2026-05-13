#!/usr/bin/env bash
cd /home/tsellyov/Projetos/TsellCoin/tsellcoin-core

echo "Node1:"
./build/bin/tsellcoin-cli -datadir=$HOME/.tsellcoin-node1 -rpcport=18389 getblockchaininfo | grep -E '"blocks"|"bestblockhash"|"chain"'

echo
echo "Node2:"
./build/bin/tsellcoin-cli -datadir=$HOME/.tsellcoin-node2 -rpcport=18391 getblockchaininfo | grep -E '"blocks"|"bestblockhash"|"chain"'

echo
echo "Connections:"
echo -n "Node1: "
./build/bin/tsellcoin-cli -datadir=$HOME/.tsellcoin-node1 -rpcport=18389 getconnectioncount
echo -n "Node2: "
./build/bin/tsellcoin-cli -datadir=$HOME/.tsellcoin-node2 -rpcport=18391 getconnectioncount
