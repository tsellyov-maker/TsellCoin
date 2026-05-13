# Genesis TODO

O próximo passo é criar um minerador de genesis block compatível com a versão exata do Bitcoin Core forkado.

Valores que vamos precisar definir:

- pszTimestamp: "12 May 2026 - TsellCoin born in Brazil"
- nTime: timestamp Unix atual
- nBits: dificuldade inicial
- nVersion: versão do bloco
- genesisReward: 50 * COIN
- pubkey do coinbase

Depois disso, precisamos preencher em `src/kernel/chainparams.cpp`:

- consensus.hashGenesisBlock
- genesis.hashMerkleRoot
- assert(consensus.hashGenesisBlock == uint256S("..."))
- assert(genesis.hashMerkleRoot == uint256S("..."))

