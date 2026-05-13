// Copyright (c) 2023 TsellCoin Developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "nontrivial-threadlocal.h"

#include <clang-tidy/ClangTidyModule.h>

class TsellCoinModule final : public clang::tidy::ClangTidyModule
{
public:
    void addCheckFactories(clang::tidy::ClangTidyCheckFactories& CheckFactories) override
    {
        CheckFactories.registerCheck<tsellcoin::NonTrivialThreadLocal>("tsellcoin-nontrivial-threadlocal");
    }
};

static clang::tidy::ClangTidyModuleRegistry::Add<TsellCoinModule>
    X("tsellcoin-module", "Adds tsellcoin checks.");

volatile int TsellCoinModuleAnchorSource = 0;
