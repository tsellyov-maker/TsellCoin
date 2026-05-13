# Copyright (c) 2023-present The TsellCoin Core developers
# Distributed under the MIT software license, see the accompanying
# file COPYING or https://opensource.org/license/mit/.

# Do not use generator expressions in test sources because the
# SOURCES property is processed to gather test suite macros.
target_sources(test_tsellcoin
  PRIVATE
    ipc_tests.cpp
)

target_link_libraries(test_tsellcoin tsellcoin_ipc_test tsellcoin_ipc)
