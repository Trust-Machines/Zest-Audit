
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.3/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { Pool } from './interfaces/pool-v1-0.ts';
import { Loan } from './interfaces/loan-v1-0.ts';
import { BridgeTest as Bridge } from './interfaces/bridge.ts';
import { LPToken } from './interfaces/lp-token.ts';

import { setContractOwner, initContractOwners, addApprovedContract, runBootstrap } from './interfaces/common.ts';

Clarinet.test({
    name: "Ensure that users can deposit and withdraw funds",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      let deployerWallet = accounts.get("deployer") as Account;
      let wallet_1 = accounts.get("wallet_1") as Account; // lp_1
      let wallet_2 = accounts.get("wallet_2") as Account;
      let wallet_7 = accounts.get("wallet_7") as Account; // pool_delegate_1
      let wallet_8 = accounts.get("wallet_8") as Account; // borrower_1
      let assetMaps = chain.getAssetsMaps();
      let pool = new Pool(chain, deployerWallet);
      let bridge = new Bridge(chain, deployerWallet);
      let lpToken = new LPToken(chain, deployerWallet);
      
      
      let block = pool.createPool(
        wallet_7.address,
        `${deployerWallet.address}.lp-token`,
        `${deployerWallet.address}.zest-reward-dist`,
        `${deployerWallet.address}.payment-fixed`,
        `${deployerWallet.address}.rewards-calc`,
        50,
        50,
        10_000_000_000,
        `${deployerWallet.address}.liquidity-vault-v1-0`,
        `${deployerWallet.address}.cp-token`,
        true,
        );
        
        block = addApprovedContract(chain, "lp-token", "loan-v1-0", deployerWallet);
        block = addApprovedContract(chain, "lp-token", "pool-v1-0", deployerWallet);
        block = addApprovedContract(chain, "lp-token", "payment-fixed", deployerWallet);
        block = addApprovedContract(chain, "payment-fixed", "loan-v1-0", deployerWallet);
        block = addApprovedContract(chain, "staking-pool-v1-0", "pool-v1-0", deployerWallet);
        initContractOwners(chain, deployerWallet);
        block = runBootstrap(chain, deployerWallet);

      block = bridge.addDeposit(60_000_000, 1, wallet_1.address);
      block = bridge.depositToPool(
        `${deployerWallet.address}.lp-token`,
        `${deployerWallet.address}.zest-reward-dist`,
        `${deployerWallet.address}.liquidity-vault-v1-0`,
        1,
        wallet_1.address);
      
      chain.mineEmptyBlock(12960);
        
      block = bridge.withdrawFromPool(
        `${deployerWallet.address}.lp-token`,
        `${deployerWallet.address}.liquidity-vault-v1-0`,
        60_000_000,
        wallet_1.address);

      
      assetMaps = chain.getAssetsMaps();
      // console.log(assetMaps);

      assertEquals(assetMaps.assets[".xbtc.xbtc"][`${wallet_1.address}`], 10_000_000_000);
      // block = chain.mineBlock([
      //   Tx.contractCall(
      //     `bridge-router-test`,
      //     'call-this',
      //       [],
      //       wallet_1.address
      //   )
      // ]);
      // console.log(block.receipts[0].result);
      
    },
});
