import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Cannot create project with invalid parameters",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('ecotide', 'create-project', [
        types.ascii("Beach Cleanup"),
        types.ascii("Monthly beach cleanup initiative"),
        types.uint(0), // Invalid max participants
        types.uint(1000)
      ], deployer.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(105);
  }
});

// [Previous tests remain unchanged...]
