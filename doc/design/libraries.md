# Libraries

| Name                     | Description |
|--------------------------|-------------|
| *libtsellcoin_cli*         | RPC client functionality used by *tsellcoin-cli* executable |
| *libtsellcoin_common*      | Home for common functionality shared by different executables and libraries. Similar to *libtsellcoin_util*, but higher-level (see [Dependencies](#dependencies)). |
| *libtsellcoin_consensus*   | Consensus functionality used by *libtsellcoin_node* and *libtsellcoin_wallet*. |
| *libtsellcoin_crypto*      | Hardware-optimized functions for data encryption, hashing, message authentication, and key derivation. |
| *libtsellcoin_kernel*      | Consensus engine and support library used for validation by *libtsellcoin_node*. |
| *libtsellcoinqt*           | GUI functionality used by *tsellcoin-qt* and *tsellcoin-gui* executables. |
| *libtsellcoin_ipc*         | IPC functionality used by *tsellcoin-node* and *tsellcoin-gui* executables to communicate when [`-DENABLE_IPC=ON`](multiprocess.md) is used. |
| *libtsellcoin_node*        | P2P and RPC server functionality used by *tsellcoind* and *tsellcoin-qt* executables. |
| *libtsellcoin_util*        | Home for common functionality shared by different executables and libraries. Similar to *libtsellcoin_common*, but lower-level (see [Dependencies](#dependencies)). |
| *libtsellcoin_wallet*      | Wallet functionality used by *tsellcoind* and *tsellcoin-wallet* executables. |
| *libtsellcoin_wallet_tool* | Lower-level wallet functionality used by *tsellcoin-wallet* executable. |
| *libtsellcoin_zmq*         | [ZeroMQ](../zmq.md) functionality used by *tsellcoind* and *tsellcoin-qt* executables. |

## Conventions

- Most libraries are internal libraries and have APIs which are completely unstable! There are few or no restrictions on backwards compatibility or rules about external dependencies. An exception is *libtsellcoin_kernel*, which, at some future point, will have a documented external interface.

- Generally each library should have a corresponding source directory and namespace. Source code organization is a work in progress, so it is true that some namespaces are applied inconsistently, and if you look at [`add_library(tsellcoin_* ...)`](../../src/CMakeLists.txt) lists you can see that many libraries pull in files from outside their source directory. But when working with libraries, it is good to follow a consistent pattern like:

  - *libtsellcoin_node* code lives in `src/node/` in the `node::` namespace
  - *libtsellcoin_wallet* code lives in `src/wallet/` in the `wallet::` namespace
  - *libtsellcoin_ipc* code lives in `src/ipc/` in the `ipc::` namespace
  - *libtsellcoin_util* code lives in `src/util/` in the `util::` namespace
  - *libtsellcoin_consensus* code lives in `src/consensus/` in the `Consensus::` namespace

## Dependencies

- Libraries should minimize what other libraries they depend on, and only reference symbols following the arrows shown in the dependency graph below:

<table><tr><td>

```mermaid

%%{ init : { "flowchart" : { "curve" : "basis" }}}%%

graph TD;

tsellcoin-cli[tsellcoin-cli]-->libtsellcoin_cli;

tsellcoind[tsellcoind]-->libtsellcoin_node;
tsellcoind[tsellcoind]-->libtsellcoin_wallet;

tsellcoin-qt[tsellcoin-qt]-->libtsellcoin_node;
tsellcoin-qt[tsellcoin-qt]-->libtsellcoinqt;
tsellcoin-qt[tsellcoin-qt]-->libtsellcoin_wallet;

tsellcoin-wallet[tsellcoin-wallet]-->libtsellcoin_wallet;
tsellcoin-wallet[tsellcoin-wallet]-->libtsellcoin_wallet_tool;

libtsellcoin_cli-->libtsellcoin_util;
libtsellcoin_cli-->libtsellcoin_common;

libtsellcoin_consensus-->libtsellcoin_crypto;

libtsellcoin_common-->libtsellcoin_consensus;
libtsellcoin_common-->libtsellcoin_crypto;
libtsellcoin_common-->libtsellcoin_util;

libtsellcoin_kernel-->libtsellcoin_consensus;
libtsellcoin_kernel-->libtsellcoin_crypto;
libtsellcoin_kernel-->libtsellcoin_util;

libtsellcoin_node-->libtsellcoin_consensus;
libtsellcoin_node-->libtsellcoin_crypto;
libtsellcoin_node-->libtsellcoin_kernel;
libtsellcoin_node-->libtsellcoin_common;
libtsellcoin_node-->libtsellcoin_util;

libtsellcoinqt-->libtsellcoin_common;
libtsellcoinqt-->libtsellcoin_util;

libtsellcoin_util-->libtsellcoin_crypto;

libtsellcoin_wallet-->libtsellcoin_common;
libtsellcoin_wallet-->libtsellcoin_crypto;
libtsellcoin_wallet-->libtsellcoin_util;

libtsellcoin_wallet_tool-->libtsellcoin_wallet;
libtsellcoin_wallet_tool-->libtsellcoin_util;

classDef bold stroke-width:2px, font-weight:bold, font-size: smaller;
class tsellcoin-qt,tsellcoind,tsellcoin-cli,tsellcoin-wallet bold
```
</td></tr><tr><td>

**Dependency graph**. Arrows show linker symbol dependencies. *Crypto* lib depends on nothing. *Util* lib is depended on by everything. *Kernel* lib depends only on consensus, crypto, and util.

</td></tr></table>

- The graph shows what _linker symbols_ (functions and variables) from each library other libraries can call and reference directly, but it is not a call graph. For example, there is no arrow connecting *libtsellcoin_wallet* and *libtsellcoin_node* libraries, because these libraries are intended to be modular and not depend on each other's internal implementation details. But wallet code is still able to call node code indirectly through the `interfaces::Chain` abstract class in [`interfaces/chain.h`](../../src/interfaces/chain.h) and node code calls wallet code through the `interfaces::ChainClient` and `interfaces::Chain::Notifications` abstract classes in the same file. In general, defining abstract classes in [`src/interfaces/`](../../src/interfaces/) can be a convenient way of avoiding unwanted direct dependencies or circular dependencies between libraries.

- *libtsellcoin_crypto* should be a standalone dependency that any library can depend on, and it should not depend on any other libraries itself.

- *libtsellcoin_consensus* should only depend on *libtsellcoin_crypto*, and all other libraries besides *libtsellcoin_crypto* should be allowed to depend on it.

- *libtsellcoin_util* should be a standalone dependency that any library can depend on, and it should not depend on other libraries except *libtsellcoin_crypto*. It provides basic utilities that fill in gaps in the C++ standard library and provide lightweight abstractions over platform-specific features. Since the util library is distributed with the kernel and is usable by kernel applications, it shouldn't contain functions that external code shouldn't call, like higher level code targeted at the node or wallet. (*libtsellcoin_common* is a better place for higher level code, or code that is meant to be used by internal applications only.)

- *libtsellcoin_common* is a home for miscellaneous shared code used by different TsellCoin Core applications. It should not depend on anything other than *libtsellcoin_util*, *libtsellcoin_consensus*, and *libtsellcoin_crypto*.

- *libtsellcoin_kernel* should only depend on *libtsellcoin_util*, *libtsellcoin_consensus*, and *libtsellcoin_crypto*.

- The only thing that should depend on *libtsellcoin_kernel* internally should be *libtsellcoin_node*. GUI and wallet libraries *libtsellcoinqt* and *libtsellcoin_wallet* in particular should not depend on *libtsellcoin_kernel* and the unneeded functionality it would pull in, like block validation. To the extent that GUI and wallet code need scripting and signing functionality, they should be able to get it from *libtsellcoin_consensus*, *libtsellcoin_common*, *libtsellcoin_crypto*, and *libtsellcoin_util*, instead of *libtsellcoin_kernel*.

- GUI, node, and wallet code internal implementations should all be independent of each other, and the *libtsellcoinqt*, *libtsellcoin_node*, *libtsellcoin_wallet* libraries should never reference each other's symbols. They should only call each other through [`src/interfaces/`](../../src/interfaces/) abstract interfaces.

## Work in progress

- Validation code is moving from *libtsellcoin_node* to *libtsellcoin_kernel* as part of [The libtsellcoinkernel Project #27587](https://github.com/tsellcoin/tsellcoin/issues/27587)
