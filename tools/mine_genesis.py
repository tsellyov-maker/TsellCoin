import hashlib
import struct
import time

COIN = 100_000_000

psz_timestamp = b"12 May 2026 - TsellCoin born in Brazil"
n_time = int(time.time())
n_bits = 0x1f00ffff
n_version = 1
reward = 50 * COIN

pubkey = bytes.fromhex(
    "04678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61de"
    "b649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5f"
)

def sha256d(data):
    return hashlib.sha256(hashlib.sha256(data).digest()).digest()

def varint(n):
    if n < 0xfd:
        return bytes([n])
    if n <= 0xffff:
        return b"\xfd" + struct.pack("<H", n)
    if n <= 0xffffffff:
        return b"\xfe" + struct.pack("<I", n)
    return b"\xff" + struct.pack("<Q", n)

def scriptnum(n):
    if n == 0:
        return b""
    result = bytearray()
    negative = n < 0
    value = -n if negative else n
    while value:
        result.append(value & 0xff)
        value >>= 8
    if result[-1] & 0x80:
        result.append(0x80 if negative else 0)
    elif negative:
        result[-1] |= 0x80
    return bytes(result)

def push(data):
    if isinstance(data, int):
        data = scriptnum(data)
    if len(data) < 0x4c:
        return bytes([len(data)]) + data
    raise ValueError("pushdata grande demais para este script simples")

def compact_to_target(bits):
    exponent = bits >> 24
    mantissa = bits & 0x007fffff
    if exponent <= 3:
        return mantissa >> (8 * (3 - exponent))
    return mantissa << (8 * (exponent - 3))

script_sig = push(486604799) + push(4) + push(psz_timestamp)
script_pubkey = push(pubkey) + b"\xac"

tx = (
    struct.pack("<I", 1)
    + varint(1)
    + bytes(32)
    + struct.pack("<I", 0xffffffff)
    + varint(len(script_sig))
    + script_sig
    + struct.pack("<I", 0xffffffff)
    + varint(1)
    + struct.pack("<Q", reward)
    + varint(len(script_pubkey))
    + script_pubkey
    + struct.pack("<I", 0)
)

merkle_root = sha256d(tx)
target = compact_to_target(n_bits)

print("Mining genesis...")
print("timestamp:", psz_timestamp.decode())
print("nTime:", n_time)
print("nBits:", hex(n_bits))
print("target:", hex(target))

for nonce in range(0, 0xffffffff):
    header = (
        struct.pack("<I", n_version)
        + bytes(32)
        + merkle_root
        + struct.pack("<I", n_time)
        + struct.pack("<I", n_bits)
        + struct.pack("<I", nonce)
    )

    block_hash = sha256d(header)
    block_hash_int = int.from_bytes(block_hash[::-1], "big")

    if block_hash_int <= target:
        print("\nFOUND")
        print("nVersion:", n_version)
        print("nTime:", n_time)
        print("nBits:", hex(n_bits))
        print("nNonce:", nonce)
        print("genesis hash:", block_hash[::-1].hex())
        print("merkle root:", merkle_root[::-1].hex())
        break
else:
    print("Não achou nonce. Aumente o alvo/diminua dificuldade.")
