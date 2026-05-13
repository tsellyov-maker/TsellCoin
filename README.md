# TsellCoin Core

TsellCoin is an experimental Bitcoin Core fork created for learning, testing, and private network experimentation.

## Current Status

- Custom genesis block
- Custom Bech32 prefix: `tsc`
- Custom P2P port: `18388`
- Local node working
- Public VPS node working
- Mining working
- Wallets working
- P2P sync working
- First confirmed transaction completed

## Network Parameters

| Parameter | Value |
|---|---|
| Coin name | TsellCoin |
| Symbol | TSC |
| Bech32 prefix | `tsc` |
| P2P port | `18388` |
| Local RPC node1 | `18389` |
| VPS IP | `109.199.100.175` |
| Genesis hash | `000095e23d5aa4c0fcc3cdf77dcc0f223bfd11bde228600a1adf534298e96d8c` |

## Warning

This is experimental software. Do not use this as an investment product, payment system, public sale, or financial promise.

## Local Node

Start node1:

```bash
./scripts/start-node1.sh