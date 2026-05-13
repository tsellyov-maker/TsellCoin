# TsellCoin Core - especificação inicial

Nome: TsellCoin
Ticker: TSC
Modelo: Proof-of-Work estilo Bitcoin
Base: fork do Bitcoin Core

## Parâmetros escolhidos inicialmente

- Algoritmo PoW: SHA-256d, igual Bitcoin
- Tempo de bloco: 10 minutos
- Recompensa inicial: 50 TSC
- Halving: a cada 210.000 blocos
- Supply máximo aproximado: 21.000.000 TSC
- Casas decimais: 8
- Porta P2P sugerida: 18388
- Porta RPC sugerida: 18389
- Prefixo Bech32 sugerido: tsc
- Prefixo Base58 P2PKH sugerido: 65
- Prefixo Base58 Script sugerido: 125
- Prefixo chave privada sugerido: 193

## Arquivos críticos para editar

1. src/kernel/chainparams.cpp
   - genesis block
   - pchMessageStart
   - porta padrão
   - seeds DNS
   - prefixos de endereço
   - checkpoints
   - hashGenesisBlock
   - consensus.hashGenesisBlock

2. src/consensus/amount.h
   - MAX_MONEY, caso mude o supply

3. src/validation.cpp e arquivos de subsidy
   - regra de recompensa/halving, se mudar a emissão

4. src/chainparamsbase.cpp
   - portas RPC e nomes da rede

5. src/common/args.cpp e arquivos de config
   - nome do diretório de dados, exemplo: ~/.tsellcoin

6. share/rpcauth/rpcauth.py
   - continua útil para criar senha RPC

## Genesis block

Você precisa gerar um genesis block próprio.
Não use o genesis do Bitcoin, senão sua rede fica conceitualmente errada.

Dados que devem ser únicos:
- timestamp textual
- nTime
- nonce
- nBits
- merkle root
- genesis hash

Exemplo de timestamp textual:
"12 May 2026 - TsellCoin born in Brazil"

## Ordem correta

1. Compilar Bitcoin Core puro para garantir que o ambiente funciona.
2. Reverter sed se algo quebrou demais.
3. Editar chainparams.cpp manualmente.
4. Gerar genesis block.
5. Colocar genesis hash e merkle root no código.
6. Compilar tsellcoind.
7. Rodar nó 1.
8. Rodar nó 2 em outra máquina/VPS.
9. Conectar os dois nós com addnode.
10. Minerar blocos iniciais.

